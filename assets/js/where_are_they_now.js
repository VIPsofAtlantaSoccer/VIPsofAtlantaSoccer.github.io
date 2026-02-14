( function ( ) {

  const Players = window.Where_Are_They_Now_Players || [ ];

  console.log(
    "Where_Are_They_Now_Players:",
    Array.isArray( Players ) ? Players.length : Players
  );

  const Warning_Host = document.getElementById( "Warning" );

  if ( !Array.isArray( Players ) || Players.length === 0 ) {
    if ( Warning_Host ) {
      Warning_Host.innerHTML =
        `<div class="Data_Warning">
          <strong>No player data loaded.</strong><br>
          Confirm your file exists at <code>_data/Where_Are_They_Now.json</code>.
        </div>`;
    }
    return;
  }

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
    maxClusterRadius: 5,

    // Critical: keep clustering enabled so spiderfy can separate stacked markers
    // If you disable clustering at zoom 10, identical coords will overlap again.
    disableClusteringAtZoom: 19,

    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false
  } );

  Leaflet_Map.addLayer( Cluster_Group );


  const Markers_By_Id = new Map( ); // normalized Player_Name -> marker

  function Normalize( Value ) {
    return ( Value || "" ).toString( ).trim( ).toLowerCase( );
  }

  function Safe_Text( Value ) {
    return ( Value == null ) ? "" : String( Value ).trim( );
  }

  function Get_Player_Display_Name( Player ) {
    return Safe_Text( Player.Player_Name || Player.Name );
  }

  function Is_Template_Player( Player ) {

    const Name_Key = Normalize( Get_Player_Display_Name( Player ) );
    return ( Name_Key === "__template__" );
  }

  function Get_Player_Status( Player ) {

    // Normalize older/alternate values if they exist in your data
    let Status = Safe_Text( Player.Status );

    if ( Status === "Deceased" ) {
      Status = "Passed_Away";
    }

    return Status;
  }

  function Get_Player_Country_Code( Player ) {
    return Safe_Text( Player.Country_Code );
  }

  function Get_Player_Country_Label( Player ) {
    return Safe_Text( Player.Current_Country || Player.Country_Code );
  }

  function Get_Player_Location( Player ) {
    return [ Safe_Text( Player.Current_City ), Safe_Text( Player.Current_Country ) ]
      .filter( v => !!v )
      .join( ", " );
  }

  function Get_Player_Current_Team( Player ) {
    return Safe_Text( Player.Current_Team );
  }

  function Get_Player_Profile_Url( Player ) {
    return Safe_Text( Player.Profile_Url );
  }

  function Get_Player_ATLUTD_Team( Player ) {

    // Supports both styles:
    // - "ATLUTD_Team": "ATLUTD"
    // - "ATLUTD Team": "ATLUTD"
    // Plus a couple “legacy” fields you used earlier.
    return Safe_Text(
      Player.ATLUTD_Team ||
      Player[ "ATLUTD Team" ] ||
      Player.Former_ATLUTD_Team ||
      Player.Former_Team
    );
  }

  function Has_Gps( Player ) {
    return ( Player.Latitude != null && Player.Longitude != null );
  }

  function Escape_Html( Value ) {
    return String( Value || "" )
      .replaceAll( "&", "&amp;" )
      .replaceAll( "<", "&lt;" )
      .replaceAll( ">", "&gt;" )
      .replaceAll( "\"", "&quot;" )
      .replaceAll( "'", "&#039;" );
  }

  function Get_Player_Notes( Player ) {
    return Safe_Text( Player.Notes );
  }

  function Get_Player_Current_Job( Player ) {
    return Safe_Text( Player.Current_Job );
  }

  function Build_Player_Icon( Thumbnail_Url ) {

    const Safe_Thumb = Thumbnail_Url || "";

    const Html = `
      <img
        class="Player_Icon"
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

  function Build_Popup_Html( Player ) {

    const Player_Name = Get_Player_Display_Name( Player );
    const Status = Get_Player_Status( Player );

    const Current_Team = Get_Player_Current_Team( Player );
    const Current_Job = Get_Player_Current_Job( Player );
    const Notes = Get_Player_Notes( Player );

    const Location = Get_Player_Location( Player );
    const ATLUTD_Team = Get_Player_ATLUTD_Team( Player );

    const Profile_Url = Get_Player_Profile_Url( Player );

    const Name_Html = Profile_Url
      ? `<a href="${ Profile_Url }"><strong>${ Escape_Html( Player_Name ) }</strong></a>`
      : `<strong>${ Escape_Html( Player_Name ) }</strong>`;

    // Primary detail line: depends on status
    let Primary_Detail_Label = "";
    let Primary_Detail_Value = "";

    if ( Status === "Retired" ) {
      Primary_Detail_Label = "Current Job";
      Primary_Detail_Value = Current_Job;
    } else if ( Status === "Injured" ) {
      Primary_Detail_Label = "Notes";
      Primary_Detail_Value = Notes;
    } else {
      Primary_Detail_Label = "Current Team";
      Primary_Detail_Value = Current_Team;
    }

    // Secondary detail line: show whatever else is meaningful
    let Secondary_Detail_Label = "";
    let Secondary_Detail_Value = "";

    if ( Status === "Retired" ) {
      Secondary_Detail_Label = "Last Team";
      Secondary_Detail_Value = Current_Team;
    } else if ( Status === "Injured" ) {
      Secondary_Detail_Label = "Current Team";
      Secondary_Detail_Value = Current_Team;
    } else {
      Secondary_Detail_Label = "Notes";
      Secondary_Detail_Value = Notes;
    }

    function Detail_Row( Label, Value, Extra_Style ) {

      if ( !Value ) {
        return "";
      }

      return `
        <div style="opacity:0.88; ${ Extra_Style || "" }">
          ${ Escape_Html( Label ) }: <strong>${ Escape_Html( Value ) }</strong>
        </div>
      `;
    }

    // Nicer status label
    let Status_Label = Status;

    if ( Status_Label === "Front_Office" ) {
      Status_Label = "Front Office";
    } else if ( Status_Label === "Passed_Away" ) {
      Status_Label = "Passed Away";
    }

    return `
      <div class="Map_Popup">
        <img loading="lazy" src="${ Player.Thumbnail || "" }" alt="">
        <div>
          <div>${ Name_Html }</div>

          ${ ATLUTD_Team ? `<div style="opacity:0.8;">ATLUTD Team: <strong>${ Escape_Html( ATLUTD_Team ) }</strong></div>` : "" }
          ${ Location ? `<div style="opacity:0.78;">${ Escape_Html( Location ) }</div>` : "" }

          ${ Status_Label ? `<div style="margin-top:6px; opacity:0.85;">Status: <strong>${ Escape_Html( Status_Label ) }</strong></div>` : "" }

          <div style="margin-top:6px;">
            ${ Detail_Row( Primary_Detail_Label, Primary_Detail_Value, "" ) }
            ${ Detail_Row( Secondary_Detail_Label, Secondary_Detail_Value, "" ) }
          </div>
        </div>
      </div>
    `;
  }

  //-----------------------------------------------------------------------------------------------------------//
  // Filters
  //-----------------------------------------------------------------------------------------------------------//

  function Get_Filter_Values( ) {

    const Country_Code = document.getElementById( "Country_Filter" )?.value || "";
    const Status = document.getElementById( "Status_Filter" )?.value || "";
    const ATLUTD_Team = document.getElementById( "ATLUTD_Team_Filter" )?.value || "";

    return { Country_Code, Status, ATLUTD_Team };
  }

  function Player_Passes_Filters( Player, Filters ) {

    if ( Filters.Country_Code && Get_Player_Country_Code( Player ) !== Filters.Country_Code ) {
      return false;
    }

    if ( Filters.Status && Get_Player_Status( Player ) !== Filters.Status ) {
      return false;
    }

    if ( Filters.ATLUTD_Team ) {
      const Player_Team = Get_Player_ATLUTD_Team( Player );
      if ( Player_Team !== Filters.ATLUTD_Team ) {
        return false;
      }
    }

    return true;
  }

  function Get_Filtered_Players( ) {

    const Filters = Get_Filter_Values( );

    return Players.filter( P => {

      if ( Is_Template_Player( P ) ) {
        return false;
      }

      return Player_Passes_Filters( P, Filters );
    } );
  }

  //-----------------------------------------------------------------------------------------------------------//
  // Summary + Details (dynamic)
  //-----------------------------------------------------------------------------------------------------------//

  function Set_Text_By_Id( Id, Value ) {
    const El = document.getElementById( Id );
    if ( El ) {
      El.textContent = String( Value );
    }
  }

  function Build_Summary( Filtered_Players ) {

    const Countries = new Map( );
    const ATLUTD_Teams = new Map( );

    let Total_Mapped = 0;

    const Counts = {
      Active: 0,
      Injured: 0,
      Retired: 0,
      Coach: 0,
      Front_Office: 0,
      Media: 0,
      Passed_Away: 0,
      Unknown: 0
    };

    for ( const P of Filtered_Players ) {

      const Country_Code = Get_Player_Country_Code( P );
      if ( Country_Code ) {
        Countries.set( Country_Code, true );
      }

      const ATLUTD_Team = Get_Player_ATLUTD_Team( P );
      if ( ATLUTD_Team ) {
        ATLUTD_Teams.set( ATLUTD_Team, true );
      }

      if ( Has_Gps( P ) ) {
        Total_Mapped += 1;
      }

      const Status = Get_Player_Status( P );

      if ( Status === "Active" ) {
        Counts.Active += 1;
      } else if ( Status === "Injured" ) {
        Counts.Injured += 1;
      } else if ( Status === "Retired" ) {
        Counts.Retired += 1;
      } else if ( Status === "Coach" ) {
        Counts.Coach += 1;
      } else if ( Status === "Front_Office" ) {
        Counts.Front_Office += 1;
      } else if ( Status === "Media" ) {
        Counts.Media += 1;
      } else if ( Status === "Passed_Away" ) {
        Counts.Passed_Away += 1;
      } else {
        Counts.Unknown += 1;
      }
    }

    Set_Text_By_Id( "Where_Total_Players", Filtered_Players.length );
    Set_Text_By_Id( "Where_Total_Countries", Countries.size );
    Set_Text_By_Id( "Where_Total_Mapped", Total_Mapped );
    Set_Text_By_Id( "Where_Total_ATLUTD_Teams", ATLUTD_Teams.size );

    Set_Text_By_Id( "Where_Count_Active", Counts.Active );
    Set_Text_By_Id( "Where_Count_Injured", Counts.Injured );
    Set_Text_By_Id( "Where_Count_Retired", Counts.Retired );
    Set_Text_By_Id( "Where_Count_Coach", Counts.Coach );
    Set_Text_By_Id( "Where_Count_Front_Office", Counts.Front_Office );
    Set_Text_By_Id( "Where_Count_Media", Counts.Media );
    Set_Text_By_Id( "Where_Count_Passed_Away", Counts.Passed_Away );

    const Unknown_Wrap = document.getElementById( "Where_Unknown_Wrap" );
    if ( Unknown_Wrap ) {
      if ( Counts.Unknown > 0 ) {
        Unknown_Wrap.style.display = "inline";
        Set_Text_By_Id( "Where_Count_Unknown", Counts.Unknown );
      } else {
        Unknown_Wrap.style.display = "none";
      }
    }
  }

  function Build_Player_List_Item_Html( Player ) {

    const Name = Get_Player_Display_Name( Player );
    const Link = Get_Player_Profile_Url( Player );

    const Status = Get_Player_Status( Player );
    const Current_Team = Get_Player_Current_Team( Player );
    const Current_Job = Get_Player_Current_Job( Player );
    const Notes = Get_Player_Notes( Player );

    const Name_Html = Link
      ? `<a href="${ Escape_Html( Link ) }">${ Escape_Html( Name ) }</a>`
      : `${ Escape_Html( Name ) }`;

    let Detail_Value = "";

    if ( Status === "Injured" ) {
      Detail_Value = Notes;
    } else if ( Status === "Retired" ) {
      Detail_Value = Current_Job;
    } else {
      Detail_Value = Current_Team;
    }

    const Detail_Html = Detail_Value
      ? `<span class="Where_Detail_Muted"> - ${ Escape_Html( Detail_Value ) }</span>`
      : "";

    return `<li>${ Name_Html }${ Detail_Html }</li>`;
  }

  function Build_Group_Card_Html( Title, Players_In_Group ) {

    const Count = Players_In_Group.length;

    const List_Items = Players_In_Group
      .slice( )
      .sort( ( A, B ) => Get_Player_Display_Name( A ).localeCompare( Get_Player_Display_Name( B ) ) )
      .map( P => Build_Player_List_Item_Html( P ) )
      .join( "" );

    return `
      <div class="Where_Detail_Card">
        <div class="Where_Detail_Title">
          <span class="Where_Detail_Group_Name">${ Escape_Html( Title ) }</span>
          <span class="Where_Detail_Count">${ Count }</span>
        </div>
        <ul class="Where_Detail_List">
          ${ List_Items }
        </ul>
      </div>
    `;
  }

  function Build_Details( Filtered_Players ) {

    const Host = document.getElementById( "Where_Details_Container" );
    if ( !Host ) {
      return;
    }

    // Group by Status
    const Status_Order = [
      "Active",
      "Injured",
      "Retired",
      "Coach",
      "Front_Office",
      "Media",
      "Passed_Away",
      "Unknown"
    ];

    const By_Status = new Map( );
    for ( const Key of Status_Order ) {
      By_Status.set( Key, [ ] );
    }

    for ( const P of Filtered_Players ) {

      let Status = Get_Player_Status( P );

      if ( !Status ) {
        Status = "Unknown";
      }

      if ( !By_Status.has( Status ) ) {
        By_Status.set( Status, [ ] );
      }

      By_Status.get( Status ).push( P );
    }

    const Status_Cards = [ ];
    for ( const Status_Name of Status_Order ) {

      const List = By_Status.get( Status_Name ) || [ ];

      if ( List.length === 0 ) {
        continue;
      }

      let Label = Status_Name;

      if ( Status_Name === "Front_Office" ) {
        Label = "Front Office";
      } else if ( Status_Name === "Passed_Away" ) {
        Label = "Passed Away";
      }

      Status_Cards.push( Build_Group_Card_Html( Label, List ) );
    }

    // Group by ATLUTD Team
    const By_ATLUTD_Team = new Map( );

    for ( const P of Filtered_Players ) {

      const Team = Get_Player_ATLUTD_Team( P ) || "Unknown ATLUTD Team";

      if ( !By_ATLUTD_Team.has( Team ) ) {
        By_ATLUTD_Team.set( Team, [ ] );
      }

      By_ATLUTD_Team.get( Team ).push( P );
    }

    const Team_Names = [ ...By_ATLUTD_Team.keys( ) ].sort( ( A, B ) => A.localeCompare( B ) );

    const Team_Cards = Team_Names
      .map( Team => Build_Group_Card_Html( Team, By_ATLUTD_Team.get( Team ) || [ ] ) );

    Host.innerHTML = `
      <div class="Where_Detail_Section">
        <h3>By Status</h3>
        <div class="Where_Detail_Grid">
          ${ Status_Cards.join( "" ) }
        </div>
      </div>

      <div class="Where_Detail_Section">
        <h3>By ATLUTD Team</h3>
        <div class="Where_Detail_Grid">
          ${ Team_Cards.join( "" ) }
        </div>
      </div>
    `;
  }

  function Rebuild_Summary_And_Details( ) {

    const Filtered = Get_Filtered_Players( );

    Build_Summary( Filtered );
    Build_Details( Filtered );
  }

  //-----------------------------------------------------------------------------------------------------------//
  // Auto-fit support
  //-----------------------------------------------------------------------------------------------------------//

  let Default_Bounds = null;

  function Fit_Map_To_Current_Markers( ) {

    const Layers = ( typeof Cluster_Group.getLayers === "function" )
      ? Cluster_Group.getLayers( )
      : [ ];

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

    const Layers = ( typeof Cluster_Group.getLayers === "function" )
      ? Cluster_Group.getLayers( )
      : [ ];

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

  //-----------------------------------------------------------------------------------------------------------//
  // Marker build
  //-----------------------------------------------------------------------------------------------------------//

  function Clear_And_Rebuild_Markers( ) {

    Cluster_Group.clearLayers( );
    Markers_By_Id.clear( );

    const Filters = Get_Filter_Values( );

    let Skipped_No_Gps = 0;

    for ( const Player of Players ) {

      if ( Is_Template_Player( Player ) ) {
        continue;
      }

      if ( !Player_Passes_Filters( Player, Filters ) ) {
        continue;
      }

      // Allow Passed_Away (or anyone) without GPS to exist - just skip map marker
      if ( !Has_Gps( Player ) ) {
        Skipped_No_Gps += 1;
        continue;
      }

      const Marker = L.marker(
        [ Player.Latitude, Player.Longitude ],
        { icon: Build_Player_Icon( Player.Thumbnail ) }
      );

      Marker.bindPopup(
        Build_Popup_Html( Player ),
        { maxWidth: 340 }
      );

      Cluster_Group.addLayer( Marker );

      const Key = Normalize( Get_Player_Display_Name( Player ) );
      if ( Key ) {
        Markers_By_Id.set( Key, Marker );
      }
    }

    Fit_Map_To_Current_Markers( );
    Capture_Default_Bounds_If_Needed( );

    if ( Skipped_No_Gps > 0 ) {
      console.log( `Skipped ${ Skipped_No_Gps } filtered player entries without GPS (Latitude/Longitude).` );
    }
  }

  function Populate_Country_Filter( ) {

    const Country_Select = document.getElementById( "Country_Filter" );
    if ( !Country_Select ) {
      return;
    }

    Country_Select.innerHTML = `<option value="">All countries</option>`;

    const Countries = new Map( );

    for ( const Player of Players ) {

      if ( Is_Template_Player( Player ) ) {
        continue;
      }

      const Code = Get_Player_Country_Code( Player );
      if ( !Code ) {
        continue;
      }

      const Label = Get_Player_Country_Label( Player ) || Code;

      if ( !Countries.has( Code ) ) {
        Countries.set( Code, Label );
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

  function Populate_Status_Filter( ) {

    const Status_Select = document.getElementById( "Status_Filter" );
    if ( !Status_Select ) {
      return;
    }

    Status_Select.innerHTML = `<option value="">All statuses</option>`;

    const Statuses = new Map( );

    for ( const Player of Players ) {

      if ( Is_Template_Player( Player ) ) {
        continue;
      }

      const Status = Get_Player_Status( Player );
      if ( !Status ) {
        continue;
      }

      Statuses.set( Status, Status );
    }

    // Ensure Injured + Passed_Away appear even if missing in early data
    if ( !Statuses.has( "Injured" ) ) {
      Statuses.set( "Injured", "Injured" );
    }

    if ( !Statuses.has( "Passed_Away" ) ) {
      Statuses.set( "Passed_Away", "Passed_Away" );
    }

    const Order = [ "Active", "Injured", "Retired", "Coach", "Front_Office", "Media", "Passed_Away" ];

    const Values = [ ...Statuses.keys( ) ].sort( ( A, B ) => {

      const A_Index = Order.indexOf( A );
      const B_Index = Order.indexOf( B );

      if ( A_Index >= 0 && B_Index >= 0 ) {
        return A_Index - B_Index;
      }

      if ( A_Index >= 0 ) {
        return -1;
      }

      if ( B_Index >= 0 ) {
        return 1;
      }

      return A.localeCompare( B );
    } );

    for ( const Value of Values ) {

      let Label = Value;

      if ( Value === "Front_Office" ) {
        Label = "Front Office";
      } else if ( Value === "Passed_Away" ) {
        Label = "Passed Away";
      }

      const Option = document.createElement( "option" );
      Option.value = Value;
      Option.textContent = Label;
      Status_Select.appendChild( Option );
    }
  }

  function Populate_ATLUTD_Team_Filter( ) {

    const Team_Select = document.getElementById( "ATLUTD_Team_Filter" );

    if ( !Team_Select ) {
      return;
    }

    Team_Select.innerHTML = `<option value="">All ATLUTD teams</option>`;

    const Teams = new Map( );

    for ( const Player of Players ) {

      if ( Is_Template_Player( Player ) ) {
        continue;
      }

      const Team = Get_Player_ATLUTD_Team( Player );
      if ( !Team ) {
        continue;
      }

      Teams.set( Team, Team );
    }

    for ( const [ Value, Label ] of [ ...Teams.entries( ) ]
      .sort( ( a, b ) => a[ 1 ].localeCompare( b[ 1 ] ) ) ) {

      const Option = document.createElement( "option" );
      Option.value = Value;
      Option.textContent = Label;
      Team_Select.appendChild( Option );
    }
  }

  //-----------------------------------------------------------------------------------------------------------//
  // Controls
  //-----------------------------------------------------------------------------------------------------------//

  function Wire_Up_Controls( ) {

    const Country_Filter = document.getElementById( "Country_Filter" );
    const Status_Filter = document.getElementById( "Status_Filter" );
    const ATLUTD_Team_Filter = document.getElementById( "ATLUTD_Team_Filter" );

    const Search_Box = document.getElementById( "Map_Search" );
    const Reset_Button = document.getElementById( "Map_Reset" );

    function Reset_All( ) {

      if ( Search_Box ) {
        Search_Box.value = "";
      }

      if ( Country_Filter ) {
        Country_Filter.value = "";
      }

      if ( Status_Filter ) {
        Status_Filter.value = "";
      }

      if ( ATLUTD_Team_Filter ) {
        ATLUTD_Team_Filter.value = "";
      }

      Clear_And_Rebuild_Markers( );
      Rebuild_Summary_And_Details( );

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

    function On_Filter_Change( ) {
      Clear_And_Rebuild_Markers( );
      Rebuild_Summary_And_Details( );
    }

    if ( Country_Filter ) {
      Country_Filter.addEventListener( "change", ( ) => {
        On_Filter_Change( );
      } );
    }

    if ( Status_Filter ) {
      Status_Filter.addEventListener( "change", ( ) => {
        On_Filter_Change( );
      } );
    }

    if ( ATLUTD_Team_Filter ) {
      ATLUTD_Team_Filter.addEventListener( "change", ( ) => {
        On_Filter_Change( );
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

        for ( const Marker of Matches ) {
          Bounds.extend( Marker.getLatLng( ) );
        }

        Leaflet_Map.fitBounds( Bounds, {
          padding: [ 40, 40 ],
          maxZoom: 9
        } );

        Matches[ 0 ].openPopup( );

      } );
    }
  }

  Populate_Country_Filter( );
  Populate_Status_Filter( );
  Populate_ATLUTD_Team_Filter( );

  Wire_Up_Controls( );

  Clear_And_Rebuild_Markers( );
  Rebuild_Summary_And_Details( );

} )( );
