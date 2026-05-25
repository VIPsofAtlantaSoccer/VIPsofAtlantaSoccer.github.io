// ###########################################################################
// Match Day Filters - Opponent / Location / Author / Search
// Filters elements with class "MatchDay-Row" inside #MatchDay_List
// ###########################################################################
document.addEventListener( 'DOMContentLoaded', ( ) =>
{
    console.log( 'Loaded Search_Match_Days.js' );

    const Filter_Opponent = document.getElementById( 'MatchDay_Filter_Opponent' );
    const Filter_Location = document.getElementById( 'MatchDay_Filter_Location' );
    const Filter_Author   = document.getElementById( 'MatchDay_Filter_Author' );
    const Filter_Search   = document.getElementById( 'MatchDay_Filter_Search' );
    const Filter_Clear    = document.getElementById( 'MatchDay_Filter_Clear' );

    const MatchDay_List   = document.getElementById( 'MatchDay_List' );
    const MatchDay_Rows   = MatchDay_List ? Array.from( MatchDay_List.querySelectorAll( '.MatchDay-Row' ) ) : [ ];


    const Count_Visible   = document.getElementById( 'MatchDay_Filter_Visible' );
    const Count_Total     = document.getElementById( 'MatchDay_Filter_Total' );

    if ( !Filter_Opponent || !Filter_Location || !Filter_Author || !Filter_Search || !MatchDay_List )
    {
        return;
    }

    function Normalize_Text( Value )
    {
        return ( Value || '' ).toString( ).toLowerCase( ).trim( );
    }

    const Opponent_Set = new Set( );
    const Author_Set   = new Set( );

    MatchDay_Rows.forEach( ( Row ) =>
    {
        const Opponent_Name = ( Row.dataset.opponentName || '' ).trim( );
        const Author        = ( Row.dataset.author || '' ).trim( );

        if ( Opponent_Name !== '' )
        {
            Opponent_Set.add( Opponent_Name );
        }

        if ( Author !== '' )
        {
            Author_Set.add( Author );
        }
    } );

    Array.from( Opponent_Set ).sort( ( A, B ) => A.localeCompare( B ) ).forEach( ( Opponent_Name ) =>
    {
        const Option = document.createElement( 'option' );
        Option.value = Opponent_Name;
        Option.textContent = Opponent_Name;
        Filter_Opponent.appendChild( Option );
    } );

    Array.from( Author_Set ).sort( ( A, B ) => A.localeCompare( B ) ).forEach( ( Author ) =>
    {
        const Option = document.createElement( 'option' );
        Option.value = Author;
        Option.textContent = Author;
        Filter_Author.appendChild( Option );
    } );

    function Apply_Filters( )
    {
        const Selected_Opponent = Normalize_Text( Filter_Opponent.value );
        const Selected_Location = Normalize_Text( Filter_Location.value );
        const Selected_Author   = Normalize_Text( Filter_Author.value );
        const Search_Text       = Normalize_Text( Filter_Search.value );

        MatchDay_Rows.forEach( ( Row ) =>
        {
            const Row_Opponent_Name = Normalize_Text( Row.dataset.opponentName );
            const Row_Location      = Normalize_Text( Row.dataset.location );
            const Row_Author        = Normalize_Text( Row.dataset.author );
            const Row_Search        = Normalize_Text( Row.dataset.search );

            let Show = true;

            if ( Selected_Opponent !== '' && Row_Opponent_Name !== Selected_Opponent )
            {
                Show = false;
            }

            if ( Show && Selected_Location !== '' && Row_Location !== Selected_Location )
            {
                Show = false;
            }

            if ( Show && Selected_Author !== '' && Row_Author !== Selected_Author )
            {
                Show = false;
            }

            if ( Show && Search_Text !== '' && Row_Search.indexOf( Search_Text ) === -1 )
            {
                Show = false;
            }

            Row.style.display = Show ? '' : 'none';
        } );
    }

    Filter_Opponent.addEventListener( 'change', ( ) => Apply_Filters( ) );
    Filter_Location.addEventListener( 'change', ( ) => Apply_Filters( ) );
    Filter_Author.addEventListener( 'change', ( ) => Apply_Filters( ) );
    Filter_Search.addEventListener( 'input', ( ) => Apply_Filters( ) );

    if ( Filter_Clear )
    {
        Filter_Clear.addEventListener( 'click', ( ) =>
        {
            Filter_Opponent.value = '';
            Filter_Location.value = '';
            Filter_Author.value   = '';
            Filter_Search.value   = '';

            Apply_Filters( );
        } );
    }

if ( Count_Total )   { Count_Total.textContent = Article_Rows.length.toString( ); }
if ( Count_Visible ) { Count_Visible.textContent = Article_Rows.length.toString( ); }
} );