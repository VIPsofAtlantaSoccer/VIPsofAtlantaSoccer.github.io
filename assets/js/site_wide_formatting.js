( function ( ) {

	function Split_Pipe_List( Value ) {

		if ( !Value ) {
			return [ ];
		}

		return Value
			.split( "||" )
			.map( T => ( T || "" ).trim( ) )
			.filter( T => T.length > 0 );
	}

	function Parse_Replace_Rules( Value ) {

		// Format: "from=>to||from=>to"
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

	function Escape_For_Regex( Text ) {
		return Text.replace( /[.*+?^${}()|[\]\\]/g, "\\$&" );
	}

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


	function Should_Skip_Text_Node( Text_Node ) {

		// Skip if blank
		if ( !Text_Node.nodeValue || Text_Node.nodeValue.trim( ).length === 0 ) {
			return true;
		}

		// Skip inside script/style
		if ( Is_Inside_Tag( Text_Node, "script" ) || Is_Inside_Tag( Text_Node, "style" ) ) {
			return true;
		}

		return false;
	}

	function Apply_Replace_Rules( Text, Rules ) {

		let Out = Text;

		for ( const Rule of Rules ) {

			// simple search/replace (case-sensitive)
			Out = Out.split( Rule.From ).join( Rule.To );
		}

		return Out;
	}

	function Wrap_Terms_In_Text_Node( Text_Node, Terms, Tag_Name ) {

		// Prevent nested <strong> or <em> of the same type
		if ( Is_Inside_Tag( Text_Node, Tag_Name ) ) {
			return;
		}

		// Do not bold/italicize inside headings or links
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

			// 1) Replace first
			if ( Replace_Rules.length > 0 ) {

				const Updated = Apply_Replace_Rules( Text_Node.nodeValue, Replace_Rules );

				if ( Updated !== Text_Node.nodeValue ) {
					Text_Node.nodeValue = Updated;
				}
			}

			// 2) Bold + italics next
			// THESE TWO LINES ARE WHAT YOU ASKED ABOUT:
            //Wrap_Terms_In_Text_Node( Text_Node, Bold_Terms, "strong" );

            // If the node got replaced/removed by the bold step, don't try italics on it
            //if ( Text_Node.parentNode ) {
            //    Wrap_Terms_In_Text_Node( Text_Node, Italic_Terms, "em" );
            //}

			// 2) Bold pass
			Apply_Wrap_Pass( Container, Bold_Terms, "strong" );

			// 3) Italics pass (runs on the post-bold DOM)
			Apply_Wrap_Pass( Container, Italic_Terms, "em" );

		}
	}

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


    function Init( ) {

        try {

            // Marker - proves the JS actually executed
            document.documentElement.setAttribute( "data-site-wide-formatting-ran", "true" );

            const Containers = document.querySelectorAll( ".js-site-wide-formatting" );

            // Marker - proves the JS found containers
            document.documentElement.setAttribute( "data-site-wide-formatting-containers", String( Containers.length ) );

            for ( const Container of Containers ) {
                Process_Container( Container );
            }

        }
        catch ( Error ) {

            // Marker - proves the JS crashed
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
