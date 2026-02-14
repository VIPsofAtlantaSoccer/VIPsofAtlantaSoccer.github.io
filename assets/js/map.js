//---------------------------------------------------------------------------------------------------------------//
// map.js
//
// Generic Leaflet map renderer for ATLUTD VIPs map embeds.
// Expects:
// - window.Vip_Map_Configs  : Array of { Map_Id, Center_Lat, Center_Lng, Zoom, ... }
// - window.Vip_Map_Datasets : Object keyed by Map_Id containing an array of points
//
// Data item fields expected (case-sensitive):
// - Latitude, Longitude
// Optional fields:
// - Name, Stadium, Capacity, Founded, Thumbnail
//---------------------------------------------------------------------------------------------------------------//

( function ( ) {

    function Normalize_Bool( Value, Default_Value ) {

        if ( Value === undefined || Value === null ) {
            return Default_Value;
        }

        const Text = ( Value || "" ).toString( ).trim( ).toLowerCase( );

        if ( Text === "true" || Text === "1" || Text === "yes" ) {
            return true;
        }

        if ( Text === "false" || Text === "0" || Text === "no" ) {
            return false;
        }

        return Default_Value;
    }

    function Debug_Log( Config, Message, Value ) {

        if ( !Normalize_Bool( Config.Debug, false ) ) {
            return;
        }

        console.log( "[VIP_MAP]", Config.Map_Id, Message, Value );
    }

    function Debug_Show( Config, Html ) {

        if ( !Normalize_Bool( Config.Debug, false ) ) {
            return;
        }

        const Debug_Id = Config.Map_Id + "_Debug";
        const Host = document.getElementById( Debug_Id );

        if ( !Host ) {
            return;
        }

        Host.style.display = "block";
        Host.innerHTML = Html;
    }

    function Build_Popup_Html( Item ) {

        const Name     = Item.Name     || Item.ID || "Unknown";
        const Stadium  = Item.Stadium  || "Unknown";
        const Capacity = Item.Capacity || "Unknown";
        const Founded  = Item.Founded  || "Unknown";

        let Html = "";
        Html += "<div style='font-weight:800; margin-bottom:6px;'>" + Name + "</div>";
        Html += "<div><b>Stadium:</b> " + Stadium + "</div>";
        Html += "<div><b>Capacity:</b> " + Capacity + "</div>";
        Html += "<div><b>Founded:</b> " + Founded + "</div>";

        return Html;
    }

    function Build_Map_Icon( Thumbnail_Url ) {

        const Safe_Thumb = Thumbnail_Url || "";

        const Html = `
            <img
                class="Map_Icon"
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

    function Init_Single_Map( Config ) {

        const Map_Element = document.getElementById( Config.Map_Id );

        if ( !Map_Element ) {
            return;
        }

        // Apply per-map icon border width via CSS variable on the map container.
        Map_Element.style.setProperty(
            "--Map_Icon_Border_Width",
            ( Config.Icon_Border_Width !== undefined && Config.Icon_Border_Width !== null )
                ? Config.Icon_Border_Width
                : "0px"
        );


        const Raw_Data = ( window.Vip_Map_Datasets || {} )[ Config.Map_Id ] || [ ];

        Debug_Log( Config, "Dataset length:", Array.isArray( Raw_Data ) ? Raw_Data.length : Raw_Data );

        if ( !Array.isArray( Raw_Data ) ) {

            Debug_Show(
                Config,
                `<div class="Data_Warning">
                    <strong>Map dataset is not an array.</strong><br>
                    Check <code>_data/maps/${ Config.Map_Id }</code> and the include <code>Data_File</code>.
                 </div>`
            );

            return;
        }

        const Wheel_Zoom = Normalize_Bool( Config.Wheel_Zoom, true );
        const Auto_Fit   = Normalize_Bool( Config.Auto_Fit, true );

        const Leaflet_Map = L.map( Config.Map_Id, {
            scrollWheelZoom: Wheel_Zoom,
            worldCopyJump: true
        } ).setView(
            [ Config.Center_Lat, Config.Center_Lng ],
            Config.Zoom
        );

        // Force-enable wheel zoom if it's supposed to be on.
        if ( Wheel_Zoom ) {
            Leaflet_Map.scrollWheelZoom.enable( );
        }

        const Tile_Url         = Config.Tile_Url || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
        const Tile_Attribution = Config.Tile_Attribution || "&copy; OpenStreetMap contributors";
        const Tile_MaxZoom     = ( Config.Tile_MaxZoom !== undefined ? Config.Tile_MaxZoom : 19 );

        L.tileLayer( Tile_Url, {
            maxZoom: Tile_MaxZoom,
            attribution: Tile_Attribution
        } ).addTo( Leaflet_Map );


        const Cluster = L.markerClusterGroup( {
            chunkedLoading: true,
            maxClusterRadius: ( Config.MaxClusterRadius !== undefined ? Config.MaxClusterRadius : 10 ),
            disableClusteringAtZoom: ( Config.DisableClusteringAtZoom !== undefined ? Config.DisableClusteringAtZoom : 10 ),
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false
        } );

        const Points = [ ];

        for ( const Item of Raw_Data ) {

            const Lat = Item.Latitude;
            const Lng = Item.Longitude;

            if ( Lat === null || Lng === null || Lat === undefined || Lng === undefined ) {
                continue;
            }

            const Marker = L.marker(
                [ Lat, Lng ],
                { icon: Build_Map_Icon( Item.Thumbnail ) }
            );

            Marker.bindPopup( Build_Popup_Html( Item ), { maxWidth: 320 } );

            Cluster.addLayer( Marker );
            Points.push( [ Lat, Lng ] );
        }

        Leaflet_Map.addLayer( Cluster );

        Debug_Log( Config, "Valid points:", Points.length );

        // If Auto_Fit is true, fit to markers (this will override your initial Zoom).
        if ( Auto_Fit && Points.length > 0 ) {

            const Bounds = L.latLngBounds( Points );

            Leaflet_Map.fitBounds( Bounds, {
                padding: [ 20, 20 ],
                maxZoom: ( Config.FitBounds_MaxZoom !== undefined ? Config.FitBounds_MaxZoom : 13 )
            } );
        }
    }

    function Init_All_Maps( ) {

        const Configs = window.Vip_Map_Configs || [ ];

        for ( const Config of Configs ) {
            Init_Single_Map( Config );
        }
    }

    if ( document.readyState === "loading" ) {
        document.addEventListener( "DOMContentLoaded", Init_All_Maps );
    } else {
        Init_All_Maps( );
    }

} )( );
