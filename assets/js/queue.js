( function( ) {

  function Normalize( Value ) {
    if ( Value === null || Value === undefined ) {
      return "";
    }
    return String( Value ).trim( ).toLowerCase( );
  }

  function Get_Value( Id ) {
    var Element = document.getElementById( Id );
    if ( !Element ) {
      return "";
    }
    return Normalize( Element.value );
  }

  function Get_Checked( Id ) {
    var Element = document.getElementById( Id );
    if ( !Element ) {
      return false;
    }
    return Element.checked === true;
  }

  function Get_Number_Attr( Element, Attr_Name, Default_Value ) {
    var Raw = Element.getAttribute( Attr_Name );
    if ( Raw === null || Raw === undefined || Raw === "" ) {
      return Default_Value;
    }
    var Parsed = parseInt( Raw, 10 );
    if ( isNaN( Parsed ) ) {
      return Default_Value;
    }
    return Parsed;
  }

  function Get_String_Attr( Element, Attr_Name ) {
    var Raw = Element.getAttribute( Attr_Name );
    if ( Raw === null || Raw === undefined ) {
      return "";
    }
    return String( Raw );
  }

  function Get_Bool_Attr( Element, Attr_Name ) {
    var Raw = Element.getAttribute( Attr_Name );
    if ( Raw === null || Raw === undefined ) {
      return false;
    }
    return Normalize( Raw ) === "true";
  }

  function Sort_Items( Container, Items ) {

    var Sorted = Array.prototype.slice.call( Items );

    Sorted.sort( function( A, B ) {

      var A_P = Get_Number_Attr( A, "data-sort-priority", 9 );
      var B_P = Get_Number_Attr( B, "data-sort-priority", 9 );
      if ( A_P !== B_P ) {
        return A_P - B_P;
      }

      var A_T = Normalize( Get_String_Attr( A, "data-sort-title" ) );
      var B_T = Normalize( Get_String_Attr( B, "data-sort-title" ) );
      if ( A_T !== B_T ) {
        return ( A_T < B_T ) ? -1 : 1;
      }

      var A_S = Get_Number_Attr( A, "data-sort-status", 9 );
      var B_S = Get_Number_Attr( B, "data-sort-status", 9 );
      if ( A_S !== B_S ) {
        return A_S - B_S;
      }

      return 0;

    } );

    Sorted.forEach( function( Item ) {
      Container.appendChild( Item );
    } );

  }

  function Apply_Filters( ) {

    var Status_Filter = Get_Value( "Queue_Filter_Status" );
    var Category_Filter = Get_Value( "Queue_Filter_Category" );
    var Priority_Filter = Get_Value( "Queue_Filter_Priority" );
    var Author_Filter = Get_Value( "Queue_Filter_Author" );
    var Search_Filter = Get_Value( "Queue_Filter_Search" );
    var Show_Published = Get_Checked( "Queue_Show_Published" );

    var Container = document.getElementById( "Queue_List" );
    var Items = document.querySelectorAll( "#Queue_List .Queue_Item" );

    var Visible_By_Status = {};
    var Visible_Items = [];

    Items.forEach( function( Item ) {

      var Item_Status = Normalize( Item.getAttribute( "data-status" ) );
      var Item_Priority = Normalize( Item.getAttribute( "data-priority" ) );
      var Item_Author = Normalize( Item.getAttribute( "data-author" ) );
      var Item_Categories = Normalize( Item.getAttribute( "data-categories" ) );
      var Item_Search = Normalize( Item.getAttribute( "data-search" ) );
      var Item_Published = Get_Bool_Attr( Item, "data-published" );

      var Visible = true;

      // FIX: this should be based on the published flag, not Status text
      if ( !Show_Published && Item_Published ) {
        Visible = false;
      }

      if ( Visible && Status_Filter !== "" && Item_Status !== Status_Filter ) {
        Visible = false;
      }

      if ( Visible && Priority_Filter !== "" && Item_Priority !== Priority_Filter ) {
        Visible = false;
      }

      if ( Visible && Author_Filter !== "" && Item_Author !== Author_Filter ) {
        Visible = false;
      }

      if ( Visible && Category_Filter !== "" ) {

        var Category_Tokens = [];
        if ( Item_Categories !== "" ) {
          Category_Tokens = Item_Categories.split( "|" );
        }

        if ( Category_Tokens.indexOf( Category_Filter ) === -1 ) {
          Visible = false;
        }

      }

      if ( Visible && Search_Filter !== "" && Item_Search.indexOf( Search_Filter ) === -1 ) {
        Visible = false;
      }

      if ( Visible ) {
        Item.style.display = "";
        Visible_Items.push( Item );

        if ( !Visible_By_Status[ Item_Status ] ) {
          Visible_By_Status[ Item_Status ] = 0;
        }
        Visible_By_Status[ Item_Status ] += 1;
      }
      else {
        Item.style.display = "none";
      }

    } );

    if ( Container ) {
      Sort_Items( Container, Visible_Items );
    }

    var Status_Pills = document.querySelectorAll( "#Queue_Summary .Queue-pill[data-status]" );
    Status_Pills.forEach( function( Pill ) {

      var Pill_Status = Normalize( Pill.getAttribute( "data-status" ) );
      var Count_Element = Pill.querySelector( ".Queue_Status_Count" );

      if ( !Count_Element ) {
        return;
      }

      var New_Count = 0;
      if ( Visible_By_Status[ Pill_Status ] ) {
        New_Count = Visible_By_Status[ Pill_Status ];
      }

      Count_Element.textContent = String( New_Count );

    } );

  }

  function Init( ) {

    var Status = document.getElementById( "Queue_Filter_Status" );
    var Category = document.getElementById( "Queue_Filter_Category" );
    var Priority = document.getElementById( "Queue_Filter_Priority" );
    var Author = document.getElementById( "Queue_Filter_Author" );
    var Search = document.getElementById( "Queue_Filter_Search" );
    var Show_Published = document.getElementById( "Queue_Show_Published" );

    if ( Status ) { Status.addEventListener( "change", Apply_Filters ); }
    if ( Category ) { Category.addEventListener( "change", Apply_Filters ); }
    if ( Priority ) { Priority.addEventListener( "change", Apply_Filters ); }
    if ( Author ) { Author.addEventListener( "change", Apply_Filters ); }
    if ( Search ) { Search.addEventListener( "input", Apply_Filters ); }
    if ( Show_Published ) { Show_Published.addEventListener( "change", Apply_Filters ); }

    Apply_Filters( );

  }

  if ( document.readyState === "loading" ) {
    document.addEventListener( "DOMContentLoaded", Init );
  }
  else {
    Init( );
  }

} )( );
