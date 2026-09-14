import json
import os
import re
import sys
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path


Moderation_Directory = Path( ".github/moderation" )
Allowed_Category = "Article Comments"
Test_Rule_Prefix = "moderation-test-"


#---------------------------------------------------------------------------------------------------------------#
# Normalize comment text and moderation rules for consistent comparisons
# Returns normalized text
#---------------------------------------------------------------------------------------------------------------#
def Normalize_Text( Text ):
    Normalized_Text = unicodedata.normalize( "NFKC", Text )
    Normalized_Text = Normalized_Text.replace( "‘", "'" ).replace( "’", "'" )
    return Normalized_Text.casefold( )


#---------------------------------------------------------------------------------------------------------------#
# Read active moderation rules from a text file
# Returns a list containing nonblank rules that are not comments
#---------------------------------------------------------------------------------------------------------------#
def Read_Rules( File_Path ):
    if ( not File_Path.exists( ) ):
        raise FileNotFoundError( f"Moderation rule file was not found: {File_Path}" )

    Rules = []

    with File_Path.open( "r", encoding = "utf-8" ) as Rule_File:
        for Rule_Line in Rule_File:
            Rule = Rule_Line.strip( )

            if ( Rule and not Rule.startswith( "#" ) ):
                Rules.append( Normalize_Text( Rule ) )

    return Rules


#---------------------------------------------------------------------------------------------------------------#
# Find the first complete word or phrase rule contained in a comment
# Returns the matching rule, or None when no rule matches
#---------------------------------------------------------------------------------------------------------------#
def Find_Matching_Term( Comment_Text, Rules ):
    Normalized_Comment = Normalize_Text( Comment_Text )

    for Rule in Rules:
        Rule_Pattern = rf"(?<!\w){re.escape( Rule )}(?!\w)"

        if ( re.search( Rule_Pattern, Normalized_Comment ) ):
            return Rule

    return None


#---------------------------------------------------------------------------------------------------------------#
# Extract normalized domain names from links contained in a comment
# Returns a set of domain names
#---------------------------------------------------------------------------------------------------------------#
def Extract_Domains( Comment_Text ):
    Link_Pattern = re.compile(
        r"\b(?:https?://|www\.)[^\s<>\[\]()]+",
        re.IGNORECASE
    )

    Domains = set( )

    for Link in Link_Pattern.findall( Comment_Text ):
        Clean_Link = Link.rstrip( ".,;:!?\"'" )

        if ( Clean_Link.casefold( ).startswith( "www." ) ):
            Clean_Link = f"https://{Clean_Link}"

        Parsed_Link = urllib.parse.urlsplit( Clean_Link )
        Domain = ( Parsed_Link.hostname or "" ).casefold( ).rstrip( "." )

        if ( Domain.startswith( "www." ) ):
            Domain = Domain[4:]

        if ( Domain ):
            Domains.add( Domain )

    return Domains


#---------------------------------------------------------------------------------------------------------------#
# Find the first blocked domain that matches a linked domain or one of its parent domains
# Returns the matching blocked domain, or None when no domain matches
#---------------------------------------------------------------------------------------------------------------#
def Find_Matching_Domain( Comment_Text, Blocked_Domains ):
    Linked_Domains = Extract_Domains( Comment_Text )

    for Linked_Domain in Linked_Domains:
        for Blocked_Domain in Blocked_Domains:
            if (
                Linked_Domain == Blocked_Domain
                or Linked_Domain.endswith( f".{Blocked_Domain}" )
            ):
                return Blocked_Domain

    return None


#---------------------------------------------------------------------------------------------------------------#
# Submit an authenticated GraphQL request to GitHub
# Returns the data object from the GraphQL response
#---------------------------------------------------------------------------------------------------------------#
def Submit_GitHub_Request( Query, Variables, GitHub_Token ):
    Request_Data = json.dumps(
        {
            "query": Query,
            "variables": Variables,
        }
    ).encode( "utf-8" )

    Request = urllib.request.Request(
        "https://api.github.com/graphql",
        data = Request_Data,
        headers = {
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {GitHub_Token}",
            "Content-Type": "application/json",
            "User-Agent": "VIPs-of-Atlanta-Soccer-Discussion-Moderation",
            "X-GitHub-Api-Version": "2022-11-28",
        },
        method = "POST",
    )

    try:
        with urllib.request.urlopen( Request, timeout = 30 ) as Response:
            Response_Data = json.loads(
                Response.read( ).decode( "utf-8" )
            )
    except urllib.error.HTTPError as Error:
        Error_Body = Error.read( ).decode(
            "utf-8",
            errors = "replace"
        )

        raise RuntimeError(
            f"GitHub returned HTTP {Error.code}: {Error_Body}"
        ) from Error

    if ( Response_Data.get( "errors" ) ):
        raise RuntimeError(
            f"GitHub GraphQL error: {json.dumps( Response_Data['errors'] )}"
        )

    return Response_Data.get( "data", {} )


#---------------------------------------------------------------------------------------------------------------#
# Hide a Discussion comment while preserving it for review and restoration
# Returns the GitHub GraphQL response data
#---------------------------------------------------------------------------------------------------------------#
def Hide_Comment( Comment_Node_Id, GitHub_Token ):
    Query = """
        mutation Hide_Discussion_Comment( $Comment_Node_Id: ID! ) {
            minimizeComment(
                input: {
                    subjectId: $Comment_Node_Id
                    classifier: ABUSE
                }
            ) {
                minimizedComment {
                    isMinimized
                    minimizedReason
                }
            }
        }
    """

    return Submit_GitHub_Request(
        Query,
        { "Comment_Node_Id": Comment_Node_Id },
        GitHub_Token,
    )


#---------------------------------------------------------------------------------------------------------------#
# Delete a Discussion comment that matches an explicit deletion rule
# Returns the GitHub GraphQL response data
#---------------------------------------------------------------------------------------------------------------#
def Delete_Comment( Comment_Node_Id, GitHub_Token ):
    Query = """
        mutation Delete_Discussion_Comment( $Comment_Node_Id: ID! ) {
            deleteDiscussionComment(
                input: {
                    id: $Comment_Node_Id
                }
            ) {
                clientMutationId
            }
        }
    """

    return Submit_GitHub_Request(
        Query,
        { "Comment_Node_Id": Comment_Node_Id },
        GitHub_Token,
    )


#---------------------------------------------------------------------------------------------------------------#
# Determine and apply the required moderation action for a Discussion comment
# Returns an exit status for GitHub Actions
#---------------------------------------------------------------------------------------------------------------#
def Main( ):
    GitHub_Token = os.environ.get( "GITHUB_TOKEN", "" )
    Comment_Node_Id = os.environ.get( "COMMENT_NODE_ID", "" )
    Comment_Body = os.environ.get( "COMMENT_BODY", "" )
    Comment_Author = os.environ.get( "COMMENT_AUTHOR", "" )
    Repository_Owner = os.environ.get( "REPOSITORY_OWNER", "" )
    Discussion_Category = os.environ.get( "DISCUSSION_CATEGORY", "" )

    if ( Discussion_Category != Allowed_Category ):
        print(
            f"No moderation performed. Discussion category is "
            f"'{Discussion_Category}'."
        )
        return 0

    Hide_Terms = Read_Rules(
        Moderation_Directory / "Hide_Terms.txt"
    )

    Delete_Terms = Read_Rules(
        Moderation_Directory / "Delete_Terms.txt"
    )

    Delete_Domains = Read_Rules(
        Moderation_Directory / "Delete_Domains.txt"
    )

    Matched_Delete_Term = Find_Matching_Term(
        Comment_Body,
        Delete_Terms
    )

    Matched_Delete_Domain = Find_Matching_Domain(
        Comment_Body,
        Delete_Domains
    )

    Matched_Hide_Term = Find_Matching_Term(
        Comment_Body,
        Hide_Terms
    )

    Matched_Test_Rule = next(
        (
            Rule
            for Rule in [
                Matched_Delete_Term,
                Matched_Delete_Domain,
                Matched_Hide_Term,
            ]
            if (
                Rule
                and Rule.startswith( Test_Rule_Prefix )
            )
        ),
        None,
    )

    if (
        Comment_Author.casefold( ) == Repository_Owner.casefold( )
        and not Matched_Test_Rule
    ):
        print(
            f"No moderation performed. Repository owner "
            f"'{Comment_Author}' is exempt."
        )
        return 0

    if ( not GitHub_Token ):
        raise RuntimeError( "GITHUB_TOKEN was not provided." )

    if ( not Comment_Node_Id ):
        raise RuntimeError( "COMMENT_NODE_ID was not provided." )

    if ( Matched_Delete_Term ):
        Delete_Comment( Comment_Node_Id, GitHub_Token )

        print(
            f"::notice title=Discussion comment deleted::"
            f"Matched deletion term: {Matched_Delete_Term}"
        )

        return 0

    if ( Matched_Delete_Domain ):
        Delete_Comment( Comment_Node_Id, GitHub_Token )

        print(
            f"::notice title=Discussion comment deleted::"
            f"Matched blocked domain: {Matched_Delete_Domain}"
        )

        return 0

    if ( Matched_Hide_Term ):
        Hide_Comment( Comment_Node_Id, GitHub_Token )

        print(
            f"::notice title=Discussion comment hidden::"
            f"Matched hiding term: {Matched_Hide_Term}"
        )

        return 0

    print( "No moderation rule matched the Discussion comment." )
    return 0


if ( __name__ == "__main__" ):
    try:
        sys.exit( Main( ) )
    except Exception as Error:
        print(
            f"::error title=Discussion moderation failed::{Error}"
        )
        sys.exit( 1 )