//---------------------------------------------------------------------------------------------------------------#
// Season Data
// - Reads window.Season_Data_Config, written by _includes/Season_Data.html
// - For each match folder, fetches Game_Notes.csv (required), the lineup JSON, and the availability report
// - Counts a note for a player only when:
//     - the Game Phase is one of Season_Phases
//     - the note is not a substitution note
//     - the player is in the team's matchday squad that match (started, subbed on, or unused sub)
// - Players and name lookups come from each match's lineup (full surname and last word)
// - Exposes window.Season_Data_Ready, a promise that resolves to the season data
//---------------------------------------------------------------------------------------------------------------#

const Season_Phases = [ "1st Half", "2nd Half" ];
const Season_Sub_Note_Pattern = /\bsubs?\s*:|prepping/i;
const Season_Lineup_Files = [ "GameDay_Lineup.json", "Match_Lineup.json" ];
const Season_Notes_File = "Game_Notes.csv";
const Season_Availability_File = "GameDay_Availability_Report.json";

window.Season_Data_Ready = Load_Season_Data( window.Season_Data_Config );


//---------------------------------------------------------------------------------------------------------------#
// Load every match in the config
// Returns the season data object
//---------------------------------------------------------------------------------------------------------------#
async function Load_Season_Data ( Config ) {
    const Season = {
        Config: Config,
        Matches: [ ],
        Players: { },
        Appearances: [ ],
        Notes: [ ],
        Skipped: [ ]
    };

    if ( !Config || !Config.Matches ) {
        console.error( "Season data: no config found. Is Season_Data.html included on the page?" );
        return Season;
    }

    const Loaded_Matches = await Promise.all( Config.Matches.map( Load_Match_Files ) );

    for ( const Loaded of Loaded_Matches ) {
        if ( Loaded.Skip_Reason ) {
            // No notes file is expected (ex: cup games, friendlies), so it is marked quiet - no on-page note
            Season.Skipped.push( { Folder: Loaded.Match.Folder, Reason: Loaded.Skip_Reason, Quiet: Loaded.No_Notes } );
            console.warn( `Season data: skipped ${Loaded.Match.Folder} - ${Loaded.Skip_Reason}` );
            continue;
        }

        Add_Match_To_Season( Season, Loaded, Config );
    }

    Merge_Name_Only_Players( Season );

    return Season;
}


//---------------------------------------------------------------------------------------------------------------#
// A player first listed by name only (ex: "Fortune" in an early availability list) is merged into
// the same player listed later with a lineup id
// Returns nothing
//---------------------------------------------------------------------------------------------------------------#
function Merge_Name_Only_Players ( Season ) {
    const Id_Players = Object.values( Season.Players ).filter( Player => Player.Id !== Normalize_Text( Player.Name ) );

    for ( const Player of Object.values( Season.Players ) ) {
        const Key = Normalize_Text( Player.Name );

        if ( Player.Id !== Key ) {
            continue;
        }

        const Last_Word = Key.split( " " ).pop( );
        const Match = Id_Players.find( Known => Normalize_Text( Known.Name ) === Key )
                   || Id_Players.find( Known => Normalize_Text( Known.Name ).split( " " ).pop( ) === Last_Word );

        if ( !Match ) {
            continue;
        }

        Season.Appearances.forEach( Appearance => { if ( Appearance.Player === Player.Id ) Appearance.Player = Match.Id; } );
        Season.Notes.forEach( Note => { if ( Note.Player === Player.Id ) Note.Player = Match.Id; } );
        delete Season.Players[ Player.Id ];
    }
}


//---------------------------------------------------------------------------------------------------------------#
// Fetch the notes, lineup, and availability files for one match
// Returns { Match, Notes_Rows, Lineup, Availability, Skip_Reason }
//---------------------------------------------------------------------------------------------------------------#
async function Load_Match_Files ( Match ) {
    const Result = { Match: Match, Notes_Rows: null, Lineup: null, Availability: null, Skip_Reason: "", No_Notes: false };

    // Season_Data.html lists which files exist ("" = not there), so missing files are never requested.
    // Without that list (Notes_File undefined), each file is tried in turn.
    const Has_File_List = Match.Notes_File !== undefined;
    const Notes_Path = Has_File_List ? Match.Notes_File : Match.Folder + "/" + Season_Notes_File;
    const Notes_Text = Notes_Path ? await Fetch_Optional_Text( Notes_Path ) : null;

    if ( Notes_Text === null ) {
        Result.Skip_Reason = "no " + Season_Notes_File;
        Result.No_Notes = true;
        return Result;
    }

    Result.Notes_Rows = Papa.parse( Notes_Text, { header: true, skipEmptyLines: true } ).data;

    const Lineup_Paths = Has_File_List
        ? [ Match.Lineup_File ].filter( Boolean )
        : Season_Lineup_Files.map( File_Name => Match.Folder + "/" + File_Name );

    for ( const Lineup_Path of Lineup_Paths ) {
        const Lineup_Text = await Fetch_Optional_Text( Lineup_Path );

        if ( Lineup_Text !== null ) {
            Result.Lineup = Parse_Json_Safely( Lineup_Text, Lineup_Path );
            break;
        }
    }

    if ( !Result.Lineup ) {
        Result.Skip_Reason = "no readable lineup file";
        return Result;
    }

    const Availability_Path = Has_File_List ? Match.Availability_File : Match.Folder + "/" + Season_Availability_File;
    const Availability_Text = Availability_Path ? await Fetch_Optional_Text( Availability_Path ) : null;

    if ( Availability_Text !== null ) {
        Result.Availability = Parse_Json_Safely( Availability_Text, Availability_Path );
    }

    return Result;
}


//---------------------------------------------------------------------------------------------------------------#
// Add one loaded match to the season: match info, squad, and notes
// Returns nothing
//---------------------------------------------------------------------------------------------------------------#
function Add_Match_To_Season ( Season, Loaded, Config ) {
    const Lineup_Match = Loaded.Lineup.match || { };
    const Side = Find_Team_Side( Lineup_Match, Config.Team_Name_Lineup );

    if ( !Side ) {
        Season.Skipped.push( { Folder: Loaded.Match.Folder, Reason: `"${Config.Team_Name_Lineup}" not found in lineup` } );
        console.warn( `Season data: skipped ${Loaded.Match.Folder} - "${Config.Team_Name_Lineup}" not found in lineup` );
        return;
    }

    const Other_Side = Side === "home" ? "away" : "home";
    const Match_Index = Season.Matches.length;

    Season.Matches.push( {
        Index: Match_Index,
        Date: Loaded.Match.Date,
        Folder: Loaded.Match.Folder,
        Title: Loaded.Match.Title,
        Url: Loaded.Match.Url,
        Opponent: Lineup_Match[ Other_Side + "_team" ] || "",
        Period: Get_Break_Period( Loaded.Match.Date, Config )
    } );

    const Squad = Build_Squad( Loaded.Lineup.teams[ Side ], Loaded.Availability, Lineup_Match, Config.Team_Name_Lineup );

    for ( const Member of Squad ) {
        Member.Id = Resolve_Player_Id( Season.Players, Member );

        if ( !Season.Players[ Member.Id ] ) {
            Season.Players[ Member.Id ] = { Id: Member.Id, Name: Member.Name, Display: Get_Display_Name( Member.Name ) };
        }

        Season.Appearances.push( {
            Match: Match_Index,
            Player: Member.Id,
            Status: Member.Status,
            Reason: Member.Reason,
            Questionable: Member.Questionable,
            On: Member.On,
            Off: Member.Off
        } );
    }

    const In_Squad = Squad.filter( Member => [ "S", "B", "U" ].includes( Member.Status ) );
    const Lookups = In_Squad.map( Member => ( {
        Id: Member.Id,
        Pattern: Build_Name_Pattern( Member.Name, Find_Aliases( Config.Player_Aliases, Member.Name ) )
    } ) );

    for ( const Row of Loaded.Notes_Rows ) {
        const Phase = ( Row[ "Game Phase" ] || "" ).trim( );
        const Post = Row[ "Post" ] || "";

        if ( !Season_Phases.includes( Phase ) ) {
            continue;
        }

        if ( Season_Sub_Note_Pattern.test( Post ) ) {
            continue;
        }

        const Minute = parseInt( Row[ "Minute" ], 10 );
        const Normalized_Post = Normalize_Text( Post );

        for ( const Lookup of Lookups ) {
            if ( Lookup.Pattern.test( Normalized_Post ) ) {
                Season.Notes.push( {
                    Match: Match_Index,
                    Player: Lookup.Id,
                    Half: Phase === Season_Phases[ 0 ] ? 1 : 2,
                    Minute: isNaN( Minute ) ? null : Minute
                } );
            }
        }
    }
}


//---------------------------------------------------------------------------------------------------------------#
// Build the squad for one team: starters, subs, unused, and unavailable players
// Returns an array of { Id, Name, Status, Reason, Questionable, On, Off }
//   Status: S = started, B = subbed on, U = unused sub, X = unavailable
//---------------------------------------------------------------------------------------------------------------#
function Build_Squad ( Team, Availability, Lineup_Match, Team_Name ) {
    const Squad = [ ];
    const By_Key = { };

    function Add_Member ( Name, Player_Id, Status, Reason ) {
        if ( !Name || !Name.trim( ) ) {
            return null;
        }

        const Key = Normalize_Text( Name );

        if ( By_Key[ Key ] ) {
            return By_Key[ Key ];
        }

        const Member = {
            Id: Player_Id || Key,
            Name: Name.trim( ),
            Status: Status,
            Reason: Reason || "",
            Questionable: false,
            On: null,
            Off: null
        };

        By_Key[ Key ] = Member;
        Squad.push( Member );
        return Member;
    }

    if ( !Team ) {
        return Squad;
    }

    // Substitutions: who came on, who went off, and when
    const On_Minutes = { };
    const Off_Minutes = { };

    for ( const Sub of Team.subs || [ ] ) {
        const Minute = parseInt( Sub.minute, 10 );

        if ( isNaN( Minute ) ) {
            continue;
        }

        if ( Sub.player_on ) {
            On_Minutes[ Normalize_Text( Sub.player_on ) ] = Minute;
        }

        if ( Sub.player_off ) {
            Off_Minutes[ Normalize_Text( Sub.player_off ) ] = Minute;
        }
    }

    for ( const Player of Team.starters || [ ] ) {
        const Member = Add_Member( Player.name, Player.player_id, "S" );

        if ( Member ) {
            const Came_Off = Player.came_off ? parseInt( Player.came_off.minute, 10 ) : NaN;
            Member.On = 0;
            Member.Off = Off_Minutes[ Normalize_Text( Player.name ) ] ?? ( isNaN( Came_Off ) ? null : Came_Off );
        }
    }

    for ( const Sub of Team.subs || [ ] ) {
        const Member = Add_Member( Sub.player_on, Sub.player_on_id, "B" );

        if ( Member && Member.Status === "B" ) {
            Member.On = On_Minutes[ Normalize_Text( Sub.player_on ) ] ?? null;
            Member.Off = Off_Minutes[ Normalize_Text( Sub.player_on ) ] ?? null;
        }
    }

    for ( const Player of Team.unused || [ ] ) {
        Add_Member( Player.name, Player.player_id, "U" );
    }

    for ( const Player of Team.unavailable || [ ] ) {
        Add_Member( Player.name, Player.player_id, "X", Player.reason );
    }

    // Availability report: more unavailable players and reasons, plus questionable flags
    const Report_Team = Find_Availability_Team( Availability, Lineup_Match, Team_Name );

    if ( Report_Team ) {
        for ( const Player of Report_Team.unavailable || [ ] ) {
            if ( Player && Player.name ) {
                const Member = Find_Member( By_Key, Player.name ) || Add_Member( Player.name, null, "X", Player.reason );

                if ( Member.Status === "X" && !Member.Reason ) {
                    Member.Reason = Player.reason || "";
                }
            }
        }

        for ( const Player of Report_Team.questionable || [ ] ) {
            const Name = typeof Player === "string" ? Player : Player && Player.name;
            const Member = Name ? Find_Member( By_Key, Name ) : null;

            if ( Member ) {
                Member.Questionable = true;
            }
        }
    }

    return Squad;
}


//---------------------------------------------------------------------------------------------------------------#
// Players listed only by name (ex: availability reports) get the id of a known player with the same name
// Matches on full name first, then last word
// Returns the id to use
//---------------------------------------------------------------------------------------------------------------#
function Resolve_Player_Id ( Players, Member ) {
    const Key = Normalize_Text( Member.Name );

    // Already known, or the lineup gave a real player id
    if ( Players[ Member.Id ] || Member.Id !== Key ) {
        return Member.Id;
    }

    const Last_Word = Key.split( " " ).pop( );
    let Last_Word_Match = null;

    for ( const Id in Players ) {
        const Known = Normalize_Text( Players[ Id ].Name );

        if ( Known === Key ) {
            return Id;
        }

        if ( !Last_Word_Match && Known.split( " " ).pop( ) === Last_Word ) {
            Last_Word_Match = Id;
        }
    }

    return Last_Word_Match || Member.Id;
}


//---------------------------------------------------------------------------------------------------------------#
// Find a squad member by name, matching on full name or last word
// Returns the member or null
//---------------------------------------------------------------------------------------------------------------#
function Find_Member ( By_Key, Name ) {
    const Key = Normalize_Text( Name );

    if ( By_Key[ Key ] ) {
        return By_Key[ Key ];
    }

    const Last_Word = Key.split( " " ).pop( );

    for ( const Member_Key in By_Key ) {
        if ( Member_Key.split( " " ).pop( ) === Last_Word ) {
            return By_Key[ Member_Key ];
        }
    }

    return null;
}


//---------------------------------------------------------------------------------------------------------------#
// Find the team's section in an availability report
// Returns the team object or null
//---------------------------------------------------------------------------------------------------------------#
function Find_Availability_Team ( Availability, Lineup_Match, Team_Name ) {
    if ( !Availability || !Availability.teams ) {
        return null;
    }

    const Report_Match = Availability.match || Lineup_Match || { };
    const Side = Find_Team_Side( Report_Match, Team_Name );

    return Side ? Availability.teams[ Side ] : null;
}


//---------------------------------------------------------------------------------------------------------------#
// Which side is the team on: an exact name match against home_team / away_team
// Returns "home", "away", or null
//---------------------------------------------------------------------------------------------------------------#
function Find_Team_Side ( Match_Info, Team_Name ) {
    const Wanted = Normalize_Text( Team_Name );

    if ( Normalize_Text( Match_Info.home_team ) === Wanted ) {
        return "home";
    }

    if ( Normalize_Text( Match_Info.away_team ) === Wanted ) {
        return "away";
    }

    return null;
}


//---------------------------------------------------------------------------------------------------------------#
// Where a match falls relative to the break
// Returns "before", "after", "during", or "" when there is no break
//---------------------------------------------------------------------------------------------------------------#
function Get_Break_Period ( Date_Text, Config ) {
    if ( !Config.Break_Start || !Config.Break_Stop ) {
        return "";
    }

    if ( Date_Text < Config.Break_Start ) {
        return "before";
    }

    if ( Date_Text > Config.Break_Stop ) {
        return "after";
    }

    return "during";
}


//---------------------------------------------------------------------------------------------------------------#
// Extra names for a player from the aliases file (ex: "Miggy" for Miguel Almirón)
// The aliases entry is matched to the lineup name by full name, then by last word
// Returns an array of names (may be empty)
//---------------------------------------------------------------------------------------------------------------#
function Find_Aliases ( Alias_Entries, Name ) {
    if ( !Array.isArray( Alias_Entries ) || !Alias_Entries.length ) {
        return [ ];
    }

    const Key = Normalize_Text( Name );
    const Last_Word = Key.split( " " ).pop( );

    const Entry = Alias_Entries.find( Item => Normalize_Text( Item.Name ) === Key )
               || Alias_Entries.find( Item => Normalize_Text( Item.Name ).split( " " ).pop( ) === Last_Word );

    return Entry && Entry.Lookups ? Entry.Lookups.split( "|" ).map( Normalize_Text ).filter( Boolean ) : [ ];
}


//---------------------------------------------------------------------------------------------------------------#
// Build the regex that finds a player in a normalized note
// Matches the full surname (everything after the first name), the last word, and any aliases
// Returns a RegExp
//---------------------------------------------------------------------------------------------------------------#
function Build_Name_Pattern ( Name, Aliases ) {
    const Words = Normalize_Text( Name ).split( " " );
    const Options = new Set( Aliases || [ ] );

    Options.add( Words.length > 1 ? Words.slice( 1 ).join( " " ) : Words[ 0 ] );
    Options.add( Words[ Words.length - 1 ] );

    const Escaped = [ ...Options ].map( Option => Option.replace( /[.*+?^${}()|[\]\\]/g, "\\$&" ) );

    return new RegExp( "(^|[^a-z0-9])(" + Escaped.join( "|" ) + ")(?![a-z0-9])" );
}


//---------------------------------------------------------------------------------------------------------------#
// Short display name: everything after the first name
// Returns text, ex: "Emmanuel Latte Lath" -> "Latte Lath"
//---------------------------------------------------------------------------------------------------------------#
function Get_Display_Name ( Name ) {
    const Words = Name.trim( ).split( /\s+/ );
    return Words.length > 1 ? Words.slice( 1 ).join( " " ) : Words[ 0 ];
}


//---------------------------------------------------------------------------------------------------------------#
// Lowercase, accents removed, extra spaces collapsed
// Returns text
//---------------------------------------------------------------------------------------------------------------#
function Normalize_Text ( Text ) {
    return ( Text || "" )
        .normalize( "NFD" )
        .replace( /[̀-ͯ]/g, "" )
        .toLowerCase( )
        .replace( /\s+/g, " " )
        .trim( );
}


//---------------------------------------------------------------------------------------------------------------#
// Fetch a text file that may not exist
// Returns the text, or null when the file is missing
//---------------------------------------------------------------------------------------------------------------#
async function Fetch_Optional_Text ( File_Path ) {
    try {
        const Response = await fetch( encodeURI( File_Path ) );
        return Response.ok ? await Response.text( ) : null;
    }
    catch ( Error_Object ) {
        return null;
    }
}


//---------------------------------------------------------------------------------------------------------------#
// Parse JSON without stopping the page on a broken file
// Returns the object, or null when the JSON is broken
//---------------------------------------------------------------------------------------------------------------#
function Parse_Json_Safely ( Text, File_Path ) {
    try {
        return JSON.parse( Text );
    }
    catch ( Error_Object ) {
        console.warn( `Season data: could not read ${File_Path} - ${Error_Object.message}` );
        return null;
    }
}
