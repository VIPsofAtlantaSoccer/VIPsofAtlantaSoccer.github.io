// ###########################################################################
// Published Articles Filters - Category / Author / Search
// Filters elements with class "Article-Row" inside #Articles_List
// ###########################################################################
document.addEventListener( 'DOMContentLoaded', ( ) =>
{
    const Filter_Category = document.getElementById( 'Filter_Category' );
    const Filter_Author   = document.getElementById( 'Filter_Author' );
    const Filter_Search   = document.getElementById( 'Filter_Search' );

    const Articles_List   = document.getElementById( 'Articles_List' );
    const Article_Rows    = Articles_List ? Array.from( Articles_List.querySelectorAll( '.Article-Row' ) ) : [ ];

    const Count_Visible   = document.getElementById( 'Articles_Count_Visible' );
    const Count_Total     = document.getElementById( 'Articles_Count_Total' );

    if ( !Filter_Category || !Filter_Author || !Filter_Search || !Articles_List )
    {
        return;
    }

    function Normalize_Text( Value )
    {
        return ( Value || '' ).toString( ).toLowerCase( ).trim( );
    }

    function Split_Categories( Categories_Raw )
    {
        return ( Categories_Raw || '' )
            .toString( )
            .split( '|' )
            .map( ( Value ) => Value.trim( ) )
            .filter( ( Value ) => Value !== '' );
    }

    // -----------------------------
    // Build dropdown options from DOM
    // -----------------------------
    const Category_Set = new Set( );
    const Author_Set   = new Set( );

    Article_Rows.forEach( ( Row ) =>
    {
        const Categories_Raw = ( Row.dataset.categories || '' ).trim( );
        const Author         = ( Row.dataset.author || '' ).trim( );

        const Categories_List = Split_Categories( Categories_Raw );

        Categories_List.forEach( ( Category ) =>
        {
            if ( Category !== '' )
            {
                Category_Set.add( Category );
            }
        } );

        if ( Author !== '' )
        {
            Author_Set.add( Author );
        }
    } );

    Array.from( Category_Set ).sort( ( A, B ) => A.localeCompare( B ) ).forEach( ( Category ) =>
    {
        const Option = document.createElement( 'option' );
        Option.value = Category;
        Option.textContent = Category;
        Filter_Category.appendChild( Option );
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
        const Selected_Category = Normalize_Text( Filter_Category.value );
        const Selected_Author   = Normalize_Text( Filter_Author.value );
        const Search_Text       = Normalize_Text( Filter_Search.value );

        let Visible_Count = 0;

        Article_Rows.forEach( ( Row ) =>
        {
            const Categories_Raw  = ( Row.dataset.categories || '' );
            const Row_Author      = Normalize_Text( Row.dataset.author );
            const Row_Search      = Normalize_Text( Row.dataset.search );

            const Row_Categories = Split_Categories( Categories_Raw )
                .map( ( Value ) => Normalize_Text( Value ) );

            let Show = true;

            if ( Selected_Category !== '' )
            {
                if ( Row_Categories.indexOf( Selected_Category ) === -1 )
                {
                    Show = false;
                }
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

            if ( Show )
            {
                Visible_Count += 1;
            }
        } );

        if ( Count_Total )   { Count_Total.textContent = Article_Rows.length.toString( ); }
        if ( Count_Visible ) { Count_Visible.textContent = Visible_Count.toString( ); }
    }

    const Filter_Clear = document.getElementById( 'Filter_Clear' );

    Filter_Category.addEventListener( 'change', ( ) => Apply_Filters( ) );
    Filter_Author.addEventListener( 'change', ( ) => Apply_Filters( ) );
    Filter_Search.addEventListener( 'input',  ( ) => Apply_Filters( ) );

    if ( Filter_Clear )
    {
        Filter_Clear.addEventListener( 'click', ( ) =>
        {
            Filter_Category.value = '';
            Filter_Author.value   = '';
            Filter_Search.value   = '';

            Apply_Filters( );
        } );
    }

    Apply_Filters( );
} );
