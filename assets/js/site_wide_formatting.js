// Site Wide Formatting

( function ( ) {

	// ---------------------------------------------------------------------------------------------------------------#
	// Split a pipe-delimited attribute value into a clean array
	// Expected format: "Term One||Term Two||Term Three"
	// Returns an array of trimmed non-empty values
	// ---------------------------------------------------------------------------------------------------------------#
	function Split_Pipe_List( Value ) {
		if ( !Value ) {
			return [ ];
		}

		return Value
			.split( "||" )
			.map( T => ( T || "" ).trim( ) )
			.filter( T => T.length > 0 );
	}

	// ---------------------------------------------------------------------------------------------------------------#
	// Parse replacement rules from a pipe-delimited attribute value
	// Expected format: "from=>to||from=>to"
	// Returns an array of replacement rule objects
	// ---------------------------------------------------------------------------------------------------------------#
	function Parse_Replace_Rules( Value ) {
		const Rules = [ ];

		if ( !Value ) {
			return Rules;
		}

		const Parts = Value.split( "||" );

		for ( const Part of Parts ) {
			const Pieces = Part.split( "=>" );

			if ( Pieces.length < 2 ) {
				continue;
			}

			const From = ( Pieces[ 0 ] || "" ).trim( );
			const To = Pieces.slice( 1 ).join( "=>" ).trim( ); // allow "=>" inside "to"

			if ( From.length === 0 ) {
				continue;
			}

			Rules.push( { From, To } );
		}

		return Rules;
	}

	// ---------------------------------------------------------------------------------------------------------------#
	// Escape special regex characters in a term
	// Allows literal terms such as "D.C.", "U-22", or "Ballon d'Or" to be safely used in a regex
	// ---------------------------------------------------------------------------------------------------------------#
	function Escape_For_Regex( Text ) {
		return Text.replace( /[.*+?^${}()|[\]\\]/g, "\\$&" );
	}

	// ---------------------------------------------------------------------------------------------------------------#
	// Build a regex that matches any supplied formatting term
	// Sorts longest terms first so longer names match before shorter overlapping names
	// Returns null when no usable terms exist
	// ---------------------------------------------------------------------------------------------------------------#
	function Build_Term_Regex( Terms ) {
		const Clean_Terms = ( Terms || [ ] )
			.map( T => ( T || "" ).trim( ) )
			.filter( T => T.length > 0 )
			.sort( ( A, B ) => B.length - A.length ); // longest first

		if ( Clean_Terms.length === 0 ) {
			return null;
		}

		const Pattern = "(?:" + Clean_Terms.map( Escape_For_Regex ).join( "|" ) + ")";
		return new RegExp( Pattern, "g" );
	}

	// ---------------------------------------------------------------------------------------------------------------#
	// Check whether a text node is inside a specific HTML tag
	// Used to avoid formatting inside links, scripts, styles, or already-formatted nodes
	// ---------------------------------------------------------------------------------------------------------------#
	function Is_Inside_Tag( Node, Tag_Name ) {
		let Current = Node.parentNode;

		while ( Current && Current.nodeType === 1 ) {
			if ( Current.tagName && Current.tagName.toLowerCase( ) === Tag_Name.toLowerCase( ) ) {
				return true;
			}

			Current = Current.parentNode;
		}

		return false;
	}

	// ---------------------------------------------------------------------------------------------------------------#
	// Check whether a text node is inside a heading element
	// Prevents site-wide formatting from altering h1-h6 headline text
	// ---------------------------------------------------------------------------------------------------------------#
	function Is_Inside_Heading( Node ) {
		let Current = Node.parentNode;

		while ( Current && Current.nodeType === 1 ) {
			if ( Current.tagName && /^h[1-6]$/i.test( Current.tagName ) ) {
				return true;
			}

			Current = Current.parentNode;
		}

		return false;
	}

	// ---------------------------------------------------------------------------------------------------------------#
	// Determine whether a text node should be skipped during formatting
	// Skips blank text and text inside script/style tags
	// ---------------------------------------------------------------------------------------------------------------#
	function Should_Skip_Text_Node( Text_Node ) {
		if ( !Text_Node.nodeValue || Text_Node.nodeValue.trim( ).length === 0 ) {
			return true;
		}

		if ( Is_Inside_Tag( Text_Node, "script" ) || Is_Inside_Tag( Text_Node, "style" ) ) {
			return true;
		}

		return false;
	}

	// ---------------------------------------------------------------------------------------------------------------#
	// Apply simple case-sensitive text replacement rules
	// Uses split/join rather than regex so replacement values are treated literally
	// ---------------------------------------------------------------------------------------------------------------#
	function Apply_Replace_Rules( Text, Rules ) {
		let Out = Text;

		for ( const Rule of Rules ) {
			Out = Out.split( Rule.From ).join( Rule.To );
		}

		return Out;
	}

	// ---------------------------------------------------------------------------------------------------------------#
	// Wrap matching terms in a single text node with the requested HTML tag
	// Replaces the original text node with parsed nodes containing <strong> or <em>
	// ---------------------------------------------------------------------------------------------------------------#
	function Wrap_Terms_In_Text_Node( Text_Node, Terms, Tag_Name ) {
		if ( Is_Inside_Tag( Text_Node, Tag_Name ) ) {
			return;
		}

		if ( Is_Inside_Heading( Text_Node ) || Is_Inside_Tag( Text_Node, "a" ) ) {
			return;
		}

		const Regex = Build_Term_Regex( Terms );

		if ( !Regex ) {
			return;
		}

		const Text = Text_Node.nodeValue;

		if ( !Regex.test( Text ) ) {
			return;
		}

		Regex.lastIndex = 0;

		const Html = Text.replace( Regex, function ( Match ) {
			return `<${Tag_Name}>${Match}</${Tag_Name}>`;
		} );

		const Temp = document.createElement( "span" );
		Temp.innerHTML = Html;

		const Parent = Text_Node.parentNode;

		while ( Temp.firstChild ) {
			Parent.insertBefore( Temp.firstChild, Text_Node );
		}

		Parent.removeChild( Text_Node );
	}

	// ---------------------------------------------------------------------------------------------------------------#
	// Process one formatting container
	// Applies replacements first, then applies bold and italic wrapping in separate container-wide passes
	// ---------------------------------------------------------------------------------------------------------------#
	function Process_Container( Container ) {
		const Bold_Terms = Split_Pipe_List( Container.getAttribute( "data-bold-terms" ) );
		const Italic_Terms = Split_Pipe_List( Container.getAttribute( "data-italic-terms" ) );
		const Replace_Rules = Parse_Replace_Rules( Container.getAttribute( "data-replace-rules" ) );

		const Walker = document.createTreeWalker(
			Container,
			NodeFilter.SHOW_TEXT,
			null,
			false
		);

		const Text_Nodes = [ ];
		let Current;

		while ( ( Current = Walker.nextNode( ) ) ) {
			Text_Nodes.push( Current );
		}

		for ( const Text_Node of Text_Nodes ) {
			if ( Should_Skip_Text_Node( Text_Node ) ) {
				continue;
			}

			if ( Replace_Rules.length > 0 ) {
				const Updated = Apply_Replace_Rules( Text_Node.nodeValue, Replace_Rules );

				if ( Updated !== Text_Node.nodeValue ) {
					Text_Node.nodeValue = Updated;
				}
			}
		}

		Apply_Wrap_Pass( Container, Bold_Terms, "strong" );
		Apply_Wrap_Pass( Container, Italic_Terms, "em" );
	}

	// ---------------------------------------------------------------------------------------------------------------#
	// Apply one wrapping pass across a container
	// Used separately for bold terms and italic terms
	// ---------------------------------------------------------------------------------------------------------------#
	function Apply_Wrap_Pass( Container, Terms, Tag_Name ) {
		const Walker = document.createTreeWalker(
			Container,
			NodeFilter.SHOW_TEXT,
			null,
			false
		);

		const Text_Nodes = [ ];
		let Current;

		while ( ( Current = Walker.nextNode( ) ) ) {
			Text_Nodes.push( Current );
		}

		for ( const Text_Node of Text_Nodes ) {
			if ( Should_Skip_Text_Node( Text_Node ) ) {
				continue;
			}

			Wrap_Terms_In_Text_Node( Text_Node, Terms, Tag_Name );
		}
	}

	// ---------------------------------------------------------------------------------------------------------------#
	// Initialize site-wide formatting
	// Finds all formatting containers and applies configured replacements, bolding, and italics
	// ---------------------------------------------------------------------------------------------------------------#
	function Init( ) {
		try {
			document.documentElement.setAttribute( "data-site-wide-formatting-ran", "true" );

			const Containers = document.querySelectorAll( ".js-site-wide-formatting" );

			document.documentElement.setAttribute( "data-site-wide-formatting-containers", String( Containers.length ) );

			for ( const Container of Containers ) {
				Process_Container( Container );
			}
		}
		catch ( Error ) {
			document.documentElement.setAttribute( "data-site-wide-formatting-error", "true" );

			console.error( "Site-wide formatting failed:", Error );
		}
	}

	if ( document.readyState === "loading" ) {
		document.addEventListener( "DOMContentLoaded", Init );
	}
	else {
		Init( );
	}

} )( );