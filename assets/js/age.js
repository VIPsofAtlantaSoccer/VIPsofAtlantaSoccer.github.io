document.addEventListener( 'DOMContentLoaded', function ( ) {
  const Nodes = document.querySelectorAll( '.js-timeago' );

  Nodes.forEach( function ( El ) {
    const Iso = El.getAttribute( 'datetime' );
    if ( !Iso ) return;

    const Then = new Date( Iso );
    const Now  = new Date( );

    const Is_Today =
      Then.getFullYear( ) === Now.getFullYear( ) &&
      Then.getMonth( ) === Now.getMonth( ) &&
      Then.getDate( ) === Now.getDate( );

    let Text;

    if ( Is_Today ) {
      Text = 'Today';
    } else {
      const DiffMs   = Now - Then;
      const DiffDays = Math.floor( DiffMs / ( 1000 * 60 * 60 * 24 ) );

      if ( DiffDays < 1 ) {
        // This case will mostly only happen if the post is "yesterday" but < 24h ago.
        // Keep your existing behavior (or change to "Yesterday" if you want).
        const DiffHours = Math.floor( DiffMs / ( 1000 * 60 * 60 ) );
        if ( DiffHours < 1 ) {
          const DiffMins = Math.max( 1, Math.floor( DiffMs / ( 1000 * 60 ) ) );
          Text = DiffMins + ' min ago';
        } else {
          Text = DiffHours + ' hour' + ( DiffHours === 1 ? '' : 's' ) + ' ago';
        }
      } else {
        Text = DiffDays + ' day' + ( DiffDays === 1 ? '' : 's' ) + ' ago';
      }
    }

    El.textContent = Text;
  } );
} );
