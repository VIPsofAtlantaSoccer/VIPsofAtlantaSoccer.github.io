document.addEventListener( "DOMContentLoaded", function () {

  const Buttons_List       = document.querySelectorAll( "[data-timeline-filter]" );
  const Timeline_Items     = document.querySelectorAll( ".timeline-item" );
  const Year_Blocks        = document.querySelectorAll( ".timeline-year-block" );
  const Search_Input       = document.querySelector( "[data-timeline-search]" );
  const Year_Select        = document.querySelector( "[data-timeline-year]" );
  const Timeline_Container = document.querySelector( ".timeline" );

  let Category_Filter_Value = "all";
  let Year_Filter_Value     = "all";
  let Search_Filter_Value   = "";

  // Re-calculate which <hr> should be visible based on visible year blocks
  function Update_Year_Separators() {

    if ( !Timeline_Container ) {
      return;
    }

    const Children = Array.from( Timeline_Container.children );

    // Collect visible year blocks with their index
    const Visible_Years = [];
    Children.forEach( function ( Child_Element, Index_Value ) {

      if ( Child_Element.classList &&
           Child_Element.classList.contains( "timeline-year-block" ) &&
           Child_Element.style.display !== "none" ) {

        Visible_Years.push( {
          Node_Index: Index_Value,
          Node_Ref:   Child_Element
        } );
      }
    } );

    // Hide all <hr> by default
    Children.forEach( function ( Child_Element ) {
      if ( Child_Element.tagName === "HR" ) {
        Child_Element.style.display = "none";
      }
    } );

    // No or single visible year => no separators
    if ( Visible_Years.length < 2 ) {
      return;
    }

    // For each visible year except the last, show the first <hr> after it
    for ( let Index_Value = 0; Index_Value < Visible_Years.length - 1; Index_Value++ ) {

      const Start_Index = Visible_Years[ Index_Value ].Node_Index;

      for ( let Search_Index = Start_Index + 1; Search_Index < Children.length; Search_Index++ ) {

        const Child_Element = Children[ Search_Index ];

        if ( Child_Element.tagName === "HR" ) {
          Child_Element.style.display = "";
          break;
        }

        if ( Child_Element.classList &&
             Child_Element.classList.contains( "timeline-year-block" ) ) {
          // Reached another year before an <hr> – nothing to show
          break;
        }
      }
    }
  }

  function Apply_Filter() {

    const Category_Lower = Category_Filter_Value.toLowerCase();
    const Year_Lower     = Year_Filter_Value.toLowerCase();
    const Search_Lower   = Search_Filter_Value.toLowerCase();

    // Show / hide individual timeline items
    Timeline_Items.forEach( function ( Item_Element ) {

      const Category_Value = Item_Element.getAttribute( "data-category" );
      const Year_Block     = Item_Element.closest( ".timeline-year-block" );
      const Year_Value     = Year_Block ? Year_Block.getAttribute( "data-year" ) : "";
      const Text_Value     = Item_Element.textContent.toLowerCase();

      let Show_Item = true;

      if ( Category_Lower !== "all" && Category_Value !== Category_Lower ) {
        Show_Item = false;
      }

      if ( Year_Lower !== "all" && Year_Value.toLowerCase() !== Year_Lower ) {
        Show_Item = false;
      }

      if ( Search_Lower !== "" && Text_Value.indexOf( Search_Lower ) === -1 ) {
        Show_Item = false;
      }

      Item_Element.style.display = Show_Item ? "" : "none";
    } );

    // Show / hide year blocks depending on whether they still have visible items
    Year_Blocks.forEach( function ( Year_Block ) {

      const Items_In_Year = Year_Block.querySelectorAll( ".timeline-item" );
      let Has_Visible     = false;

      Items_In_Year.forEach( function ( Item ) {
        if ( Item.style.display !== "none" ) {
          Has_Visible = true;
        }
      } );

      Year_Block.style.display = Has_Visible ? "" : "none";
    } );

    // Re-calculate which <hr> separators should be visible
    Update_Year_Separators();
  }

  // Category buttons
  Buttons_List.forEach( function ( Button_Element ) {
    Button_Element.addEventListener( "click", function () {

      Category_Filter_Value = Button_Element.getAttribute( "data-timeline-filter" ) || "all";

      // Update active button styling
      Buttons_List.forEach( function ( Other_Button ) {
        Other_Button.classList.remove( "active" );
      } );
      Button_Element.classList.add( "active" );

      Apply_Filter();
    } );
  } );

  // Year dropdown
  if ( Year_Select ) {
    Year_Select.addEventListener( "change", function () {
      Year_Filter_Value = Year_Select.value || "all";
      Apply_Filter();
    } );
  }

  // Search box
  if ( Search_Input ) {
    Search_Input.addEventListener( "input", function () {
      Search_Filter_Value = Search_Input.value || "";
      Apply_Filter();
    } );
  }

  // Initial pass so separators match the initial state
  Apply_Filter();

} );
