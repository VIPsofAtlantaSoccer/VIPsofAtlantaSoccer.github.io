document.addEventListener( "DOMContentLoaded", function ( ) {
  const Map_Div = document.getElementById( "MatchDay-Map" );
  if ( !Map_Div ) { return; }

  if ( typeof L === "undefined" ) {
    console.warn( "Leaflet not loaded - skipping MatchDay map." );
    return;
  }

  const Lat = parseFloat( Map_Div.dataset.lat );
  const Lon = parseFloat( Map_Div.dataset.lon );
  const Label = Map_Div.dataset.label || "Match location";

  if ( Number.isNaN( Lat ) || Number.isNaN( Lon ) ) { return; }

  const Map = L.map( "MatchDay-Map", {
    scrollWheelZoom: true,
    dragging: true,
    zoomControl: false
  } ).setView( [ Lat, Lon ], 15 );

  L.tileLayer( "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  } ).addTo( Map );

  L.marker( [ Lat, Lon ] ).addTo( Map ).bindPopup( Label );
} );
