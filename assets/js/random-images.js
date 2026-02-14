document.addEventListener( "DOMContentLoaded", function () {

  const Containers_List = document.querySelectorAll( ".timeline-images[data-random-images]" );

  Containers_List.forEach( function ( Container_Element ) {

    const Limit_Value =
      parseInt( Container_Element.getAttribute( "data-random-images" ), 10 ) || 4;

    // Use direct children so we only touch this event’s images
    const Wrapper_List = Array.from(
      Container_Element.querySelectorAll( ":scope > .timeline-image-wrapper" )
    );

    const Total_Images = Wrapper_List.length;

    if ( Total_Images === 0 ) {
      return;
    }

    // Fisher–Yates shuffle (shuffle the elements themselves)
    for ( let i = Wrapper_List.length - 1; i > 0; i-- ) {
      const Random_Index = Math.floor( Math.random() * ( i + 1 ) );
      const Temp_Value = Wrapper_List[ i ];
      Wrapper_List[ i ] = Wrapper_List[ Random_Index ];
      Wrapper_List[ Random_Index ] = Temp_Value;
    }

    // Re-append in shuffled order (this changes what “first 4” means)
    Wrapper_List.forEach( function ( Wrapper_Element ) {
      Container_Element.appendChild( Wrapper_Element );
    } );

    // Hide anything beyond the limit
    Wrapper_List.forEach( function ( Wrapper_Element, Index_Value ) {
      Wrapper_Element.style.display = ( Index_Value < Limit_Value ) ? "" : "none";
    } );

  } );

} );
