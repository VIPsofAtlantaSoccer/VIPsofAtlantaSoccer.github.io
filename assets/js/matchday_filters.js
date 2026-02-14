// ###########################################################################
// Match Day Filters - Opponent / Location / Author / Search
// Filters elements with class "MatchDay-Row" inside #MatchDay_List
// ###########################################################################
document.addEventListener( 'DOMContentLoaded', ( ) =>
{
    const Filter_Opponent = document.getElementById( 'MatchDay_Filter_Opponent' );
    const Filter_Location = document.getElementById( 'MatchDay_Filter_Location' );
    const Filter_Author   = document.getElementById( 'MatchDay_Filter_Author' );
    const Filter_Search   = document.getElementById( 'MatchDay_Filter_Search' );
    const Filter_Clear    = document.getElementById( 'MatchDay_Filter_Clear' );

    const MatchDay_List   = document.getElementById( 'MatchDay_List' );
    const MatchDay_Rows   = MatchDay_List ? Array.from( MatchDay_List.querySelectorAll( '.MatchDay-Row' ) ) : [ ];

    if ( !Filter_Opponent || !Filter_Location || !Filter_Author || !Filter_Search || !MatchDay_List )
    {
        return;
    }

    function Normalize_Text( Value )
    {
        return ( Value || '' ).toString( ).toLowerCase( ).trim( );
    }

    // -----------------------------
    // Build dropdown options from DOM
    // Opponent dropdown: value = Opponent_ID, label = Opponent_Name
    // -----------------------------
    const Opponent_Map = new Map( );  // Opponent_ID -> Opponent_Name
    const Author_Set   = new Set( );

    MatchDay_Rows.forEach( ( Row ) =>
    {
        const Opponent_ID   = ( Row.dataset.opponentId || '' ).trim( );
        const Opponent_Name = ( Row.dataset.opponentName || '' ).trim( );
        const Author        = ( Row.dataset.author || '' ).trim( );

        if ( Opponent_ID !== '' )
        {
            if ( Opponent_Map.has( Opponent_ID ) === false )
            {
                Opponent_Map.set( Opponent_ID, Opponent_Name || Opponent_ID );
            }
        }

        if ( Author !== '' )
        {
            Author_Set.add( Author );
        }
    } );

    // Populate Opponent dropdown sorted by display name
    Array.from( Opponent_Map.entries( ) )
        .sort( ( A, B ) => ( A[1] || '' ).localeCompare( B[1] || '' ) )
        .forEach( ( Entry ) =>
        {
            const Opponent_ID   = Entry[0];
            const Opponent_Name = Entry[1];

            const Option = document.createElement( 'option' );
            Option.value = Opponent_ID;
            Option.textContent = Opponent_Name;
            Filter_Opponent.appendChild( Option );
        } );

    // Populate Author dropdown
    Array.from( Author_Set )
        .sort( ( A, B ) => A.localeCompare( B ) )
        .forEach( ( Author ) =>
        {
            const Option = document.createElement( 'option' );
            Option.value = Author;
            Option.textContent = Author;
            Filter_Author.appendChild( Option );
        } );

    function Apply_Filters( )
    {
        const Selected_Opponent_ID = Normalize_Text( Filter_Opponent.value );
        const Selected_Location    = Normalize_Text( Filter_Location.value );
        const Selected_Author      = Normalize_Text( Filter_Author.value );
        const Search_Text          = Normalize_Text( Filter_Search.value );

        MatchDay_Rows.forEach( ( Row ) =>
        {
            const Row_Opponent_ID = Normalize_Text( Row.dataset.opponentId );
            const Row_Location    = Normalize_Text( Row.dataset.location );
            const Row_Author      = Normalize_Text( Row.dataset.author );
            const Row_Search      = Normalize_Text( Row.dataset.search );

            let Show = true;

            if ( Selected_Opponent_ID !== '' && Row_Opponent_ID !== Selected_Opponent_ID )
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

        if ( Filter_Clear )
        {
            Filter_Clear.disabled =
                Filter_Opponent.value === '' &&
                Filter_Location.value === '' &&
                Filter_Author.value   === '' &&
                Filter_Search.value   === '';
        }
    }

    Filter_Opponent.addEventListener( 'change', ( ) => Apply_Filters( ) );
    Filter_Location.addEventListener( 'change', ( ) => Apply_Filters( ) );
    Filter_Author.addEventListener( 'change', ( ) => Apply_Filters( ) );
    Filter_Search.addEventListener( 'input',  ( ) => Apply_Filters( ) );

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

    Apply_Filters( );
} );
