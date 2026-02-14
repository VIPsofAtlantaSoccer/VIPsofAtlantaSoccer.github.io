( function ( ) {

  const Opponents = window.Opponents_Map_Data || [ ];

  console.log(
    "Opponents_Map_Data:",
    Array.isArray( Opponents ) ? Opponents.length : Opponents
  );

  const Warning_Host = document.getElementById( "Warning" );

  if ( !Array.isArray( Opponents ) || Opponents.length === 0 ) {
    if ( Warning_Host ) {
      Warning_Host.innerHTML =
        `<div class="Data_Warning">
          <strong>No opponent data loaded.</strong><br>
          Confirm your file exists at <code>_data/Opponents.json</code>.
        </div>`;
    }
    return;
  }

  // CHANGED: use the shared map container id
  const Leaflet_Map = L.map( "Map_Container", {
    worldCopyJump: true
  } ).setView( [ 20, 0 ], 2 );

  const Default_View = {
    Center: [ 20, 0 ],
    Zoom: 2
  };

  L.tileLayer( "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  } ).addTo( Leaflet_Map );

  const Cluster_Group = L.markerClusterGroup( {
    chunkedLoading: true,
    maxClusterRadius: 10,  // Smaller = less clustering. Larger = more clustering.

    // Optional - once you zoom in to this level or closer, stop clustering entirely.
    // (Pick a value that feels right: 6-9 is common.)
    disableClusteringAtZoom: 10,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false
  } );

  const Markers_By_Id = new Map( ); // normalized Name -> marker

  function Normalize( Value ) {
    return ( Value || "" ).toString( ).trim( ).toLowerCase( );
  }

  function Build_Opponent_Icon( Thumbnail_Url ) {

    const Safe_Thumb = Thumbnail_Url || "";

    const Html = `
      <img
        class="Opponent_Icon"
        loading="lazy"
        src="${ Safe_Thumb }"
        width="32"
        height="32"
        alt=""
      >
    `;

    return L.divIcon( {
      className: "",
      html: Html,
      iconSize: [ 32, 32 ],
      iconAnchor: [ 16, 16 ],
      popupAnchor: [ 0, -14 ]
    } );
  }

  function Build_Popup_Html( Opponent ) {

    const Location = [ Opponent.Current_City, Opponent.Current_Country ]
      .filter( v => !!v )
      .join( ", " );

    const Stadium = ( Opponent.Stadium || "" ).trim( );

    const Matches = Opponent.Matches || { };

    const Match_Items = [
      { Label: "MLS",         Key: "MLS" },
      { Label: "US Open Cup", Key: "US_Open_Cup" },
      { Label: "Leagues Cup", Key: "Leagues_Cup" },
      { Label: "CONCACAF",    Key: "CONCACAF" },
      { Label: "AmFamCup",    Key: "AmFamCup" },
      { Label: "Campeones",   Key: "Campeones" },
      { Label: "Friendlies",  Key: "Friendlies" },
      { Label: "Other",       Key: "Other" }
    ];

    const Match_Lines = Match_Items
      .map( Item => {
        const Count = Matches[ Item.Key ] || 0;
        if ( Count <= 0 ) {
          return null;
        }
        return `${ Item.Label }: ${ Count }`;
      } )
      .filter( v => !!v );

    const Total = Match_Items
      .map( Item => ( Matches[ Item.Key ] || 0 ) )
      .reduce( ( Sum, V ) => ( Sum + V ), 0 );

    return `
      <div class="Map_Popup">
        <img loading="lazy" src="${ Opponent.Thumbnail || "" }" alt="">
        <div>
          <div><strong>${ Opponent.Name || "" }</strong></div>
          ${ Stadium ? `<div style="opacity:0.8;">${ Stadium }</div>` : "" }
          <div style="opacity:0.8;">${ Location }</div>

          <div style="margin-top:6px;">
            Total Games: <strong>${ Total }</strong>
          </div>

          ${ Match_Lines.length > 0 ? `
            <div style="opacity:0.85; font-size:0.9em;">
              ${ Match_Lines.join( " - " ) }
            </div>
          ` : "" }
        </div>
      </div>
    `;
  }

  function Get_Filter_Values( ) {
    const Country_Code = document.getElementById( "Country_Filter" )?.value || "";
    const Competition_Key = document.getElementById( "Competition_Filter" )?.value || "";
    return { Country_Code, Competition_Key };
  }

  function Opponent_Passes_Filters( Opponent, Filters ) {

    if ( Filters.Country_Code && Opponent.Country_Code !== Filters.Country_Code ) {
      return false;
    }

    if ( Filters.Competition_Key ) {

      const Matches = Opponent.Matches || { };
      const Count = Matches[ Filters.Competition_Key ] || 0;

      if ( Count <= 0 ) {
        return false;
      }
    }

    return true;
  }

  //-----------------------------------------------------------------------------------------------------------//
  // Auto-fit support
  //-----------------------------------------------------------------------------------------------------------//

  let Default_Bounds = null;

  function Fit_Map_To_Current_Markers( ) {

    const Layers = Cluster_Group.getLayers( );

    if ( !Layers || Layers.length === 0 ) {
      Leaflet_Map.setView( Default_View.Center, Default_View.Zoom );
      return;
    }

    const Bounds = L.latLngBounds( );

    for ( const Layer of Layers ) {

      if ( Layer && typeof Layer.getLatLng === "function" ) {
        Bounds.extend( Layer.getLatLng( ) );
      }

    }

    if ( Bounds.isValid( ) ) {
      Leaflet_Map.fitBounds( Bounds, {
        padding: [ 40, 40 ],
        maxZoom: 6
      } );
    }
  }

  function Capture_Default_Bounds_If_Needed( ) {

    if ( Default_Bounds ) {
      return;
    }

    const Layers = Cluster_Group.getLayers( );

    if ( !Layers || Layers.length === 0 ) {
      return;
    }

    const Bounds = L.latLngBounds( );

    for ( const Layer of Layers ) {

      if ( Layer && typeof Layer.getLatLng === "function" ) {
        Bounds.extend( Layer.getLatLng( ) );
      }

    }

    if ( Bounds.isValid( ) ) {
      Default_Bounds = Bounds;
    }
  }

  function Clear_And_Rebuild_Markers( ) {

    Cluster_Group.clearLayers( );
    Markers_By_Id.clear( );

    const Filters = Get_Filter_Values( );

    for ( const Opponent of Opponents ) {

      if ( Opponent.Latitude == null || Opponent.Longitude == null ) {
        continue;
      }

      if ( !Opponent_Passes_Filters( Opponent, Filters ) ) {
        continue;
      }

      const Marker = L.marker(
        [ Opponent.Latitude, Opponent.Longitude ],
        { icon: Build_Opponent_Icon( Opponent.Thumbnail ) }
      );

      Marker.bindPopup(
        Build_Popup_Html( Opponent ),
        { maxWidth: 320 }
      );

      Cluster_Group.addLayer( Marker );

      const Key = Normalize( Opponent.Name );
      if ( Key ) {
        Markers_By_Id.set( Key, Marker );
      }
    }

    Leaflet_Map.addLayer( Cluster_Group );

    Fit_Map_To_Current_Markers( );
    Capture_Default_Bounds_If_Needed( );
  }

  function Populate_Country_Filter( ) {

    const Country_Select = document.getElementById( "Country_Filter" );
    if ( !Country_Select ) {
      return;
    }

    Country_Select.innerHTML = `<option value="">All countries</option>`;

    const Countries = new Map( );

    for ( const Opponent of Opponents ) {
      if ( Opponent.Country_Code ) {
        Countries.set(
          Opponent.Country_Code,
          Opponent.Current_Country || Opponent.Country_Code
        );
      }
    }

    for ( const [ Code, Label ] of [ ...Countries.entries( ) ]
      .sort( ( a, b ) => a[ 1 ].localeCompare( b[ 1 ] ) ) ) {

      const Option = document.createElement( "option" );
      Option.value = Code;
      Option.textContent = Label;
      Country_Select.appendChild( Option );
    }
  }

  function Populate_Competition_Filter( ) {

    const Competition_Select = document.getElementById( "Competition_Filter" );
    if ( !Competition_Select ) {
      return;
    }

    Competition_Select.innerHTML = `<option value="">All competitions</option>`;

    const Items = [
      { Label: "Friendlies",  Key: "Friendlies" },
      { Label: "MLS",         Key: "MLS" },
      { Label: "US Open Cup", Key: "US_Open_Cup" },
      { Label: "Leagues Cup", Key: "Leagues_Cup" },
      { Label: "CONCACAF",    Key: "CONCACAF" },
      { Label: "AmFamCup",    Key: "AmFamCup" },
      { Label: "Campeones",   Key: "Campeones" },
      { Label: "Other",       Key: "Other" }
    ];

    for ( const Item of Items ) {

      let Exists = false;

      for ( const Opponent of Opponents ) {
        const Matches = Opponent.Matches || { };
        const Count = Matches[ Item.Key ] || 0;

        if ( Count > 0 ) {
          Exists = true;
          break;
        }
      }

      if ( !Exists ) {
        continue;
      }

      const Option = document.createElement( "option" );
      Option.value = Item.Key;
      Option.textContent = Item.Label;
      Competition_Select.appendChild( Option );
    }
  }

  function Wire_Up_Controls( ) {

    const Country_Filter = document.getElementById( "Country_Filter" );
    const Competition_Filter = document.getElementById( "Competition_Filter" );
    const Search_Box = document.getElementById( "Map_Search" );
    const Reset_Button = document.getElementById( "Map_Reset" );

    function Reset_All( ) {

      if ( Search_Box ) {
        Search_Box.value = "";
      }

      if ( Country_Filter ) {
        Country_Filter.value = "";
      }

      if ( Competition_Filter ) {
        Competition_Filter.value = "";
      }

      Clear_And_Rebuild_Markers( );

      Leaflet_Map.closePopup( );

      if ( Default_Bounds && Default_Bounds.isValid( ) ) {
        Leaflet_Map.fitBounds( Default_Bounds, {
          padding: [ 40, 40 ],
          maxZoom: 6
        } );
      } else {
        Leaflet_Map.setView( Default_View.Center, Default_View.Zoom );
      }
    }

    if ( Country_Filter ) {
      Country_Filter.addEventListener( "change", ( ) => {
        Clear_And_Rebuild_Markers( );
      } );
    }

    if ( Competition_Filter ) {
      Competition_Filter.addEventListener( "change", ( ) => {
        Clear_And_Rebuild_Markers( );
      } );
    }

    if ( Reset_Button ) {
      Reset_Button.addEventListener( "click", ( ) => {
        Reset_All( );
      } );
    }

    if ( Search_Box ) {

      Search_Box.addEventListener( "keydown", ( Event ) => {

        if ( Event.key !== "Enter" ) {
          return;
        }

        const Query = Normalize( Search_Box.value );

        if ( !Query ) {
          return;
        }

        const Matches = [ ];

        for ( const [ Name_Key, Marker ] of Markers_By_Id.entries( ) ) {
          if ( Name_Key.includes( Query ) ) {
            Matches.push( Marker );
          }
        }

        if ( Matches.length === 0 ) {
          console.log( "No match for:", Query );
          return;
        }

        const Bounds = L.latLngBounds( );
        let Pending = Matches.length;

        for ( const Marker of Matches ) {

          Cluster_Group.zoomToShowLayer( Marker, ( ) => {

            Bounds.extend( Marker.getLatLng( ) );

            Pending -= 1;

            if ( Pending === 0 ) {

              Leaflet_Map.fitBounds( Bounds, {
                padding: [ 40, 40 ],
                maxZoom: 9
              } );

              Matches[ 0 ].openPopup( );
            }

          } );

        }

      } );
    }
  }

  Populate_Country_Filter( );
  Populate_Competition_Filter( );
  Wire_Up_Controls( );
  Clear_And_Rebuild_Markers( );

} )( );
