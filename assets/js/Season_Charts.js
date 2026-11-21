//---------------------------------------------------------------------------------------------------------------#
// Season Charts
// - Draws every .SeasonChart element on the page once window.Season_Data_Ready resolves
// - data-chart picks the chart; colors come from CSS variables on .SeasonChart (--SeasonChart-Color-1, -2, -3)
//---------------------------------------------------------------------------------------------------------------#

const Season_Chart_Renderers = {
    player_lines: Render_Player_Lines_Chart,
    notes_grid: Render_Notes_Grid,
    start_vs_bench: Render_Start_Vs_Bench_Chart,
    minute_buckets: Render_Minute_Buckets_Chart,
    halves: Render_Halves_Chart,
    availability_grid: Render_Availability_Grid
};

const Season_Bucket_Labels = [ "0", "5", "10", "15", "20", "25", "30", "35", "40", "45+",
                               "45", "50", "55", "60", "65", "70", "75", "80", "85", "90+" ];

document.addEventListener( "DOMContentLoaded", function ( ) {
    Initialize_Season_Charts( );
} );


//---------------------------------------------------------------------------------------------------------------#
// Find every chart on the page and draw it
// Returns nothing
//---------------------------------------------------------------------------------------------------------------#
async function Initialize_Season_Charts ( ) {
    const Chart_Elements = document.querySelectorAll( ".SeasonChart" );

    if ( !Chart_Elements.length || !window.Season_Data_Ready ) {
        return;
    }

    const Season = await window.Season_Data_Ready;

    for ( const Chart_Element of Chart_Elements ) {
        const Renderer = Season_Chart_Renderers[ Chart_Element.dataset.chart ];

        if ( !Renderer ) {
            console.warn( `Season charts: unknown chart "${Chart_Element.dataset.chart}"` );
            continue;
        }

        try {
            Renderer( Chart_Element, Season );
            Show_Skipped_Note( Chart_Element, Season );
        }
        catch ( Error_Object ) {
            console.error( `Season charts: failed to draw "${Chart_Element.dataset.chart}"`, Error_Object );
        }
    }
}


//---------------------------------------------------------------------------------------------------------------#
// chart="player_lines" - notes per match for chosen players, one line each (ex: the DPs)
// A point appears only for matches the player started or came on; the line breaks across the season break
// Returns nothing
//---------------------------------------------------------------------------------------------------------------#
function Render_Player_Lines_Chart ( Chart_Element, Season ) {
    const Wanted_Names = ( Chart_Element.dataset.players || "" ).split( "|" ).map( Name => Name.trim( ) ).filter( Boolean );
    const Colors = Get_Line_Colors( Chart_Element );
    const Datasets = [ ];

    Wanted_Names.forEach( ( Wanted_Name, Name_Index ) => {
        const Player = Find_Season_Player( Season, Wanted_Name );

        if ( !Player ) {
            console.warn( `Season charts: player "${Wanted_Name}" not found in any lineup` );
            return;
        }

        const Points = Season.Matches.map( Match => {
            const Appearance = Season.Appearances.find( Item => Item.Match === Match.Index && Item.Player === Player.Id );

            if ( !Appearance || ![ "S", "B" ].includes( Appearance.Status ) ) {
                return null;
            }

            return Season.Notes.filter( Note => Note.Match === Match.Index && Note.Player === Player.Id ).length;
        } );

        const Status_By_Match = Season.Matches.map( Match => {
            const Appearance = Season.Appearances.find( Item => Item.Match === Match.Index && Item.Player === Player.Id );
            return Appearance ? Appearance.Status : "";
        } );

        const Color = Colors[ Name_Index % Colors.length ];

        Datasets.push( {
            label: Player.Display,
            data: Points,
            Status_By_Match: Status_By_Match,
            borderColor: Color,
            backgroundColor: Color,
            borderWidth: 2.5,
            pointRadius: 4,
            pointHoverRadius: 6,
            spanGaps: false,
            tension: 0.15,
            segment: {
                borderColor: Segment => Crosses_Break( Season, Segment.p0DataIndex, Segment.p1DataIndex ) ? "transparent" : undefined
            }
        } );
    } );

    new Chart( Chart_Element.querySelector( "canvas" ), {
        type: "line",
        data: {
            labels: Season.Matches.map( Match => Format_Short_Date( Match.Date ) ),
            datasets: Datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "nearest", intersect: true },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: `${Count_Label( Season )} per match` } },
                x: { ticks: { autoSkip: false, maxRotation: 60, minRotation: 60 } }
            },
            plugins: {
                legend: { position: "top" },
                tooltip: {
                    callbacks: {
                        title: Items => {
                            const Match = Season.Matches[ Items[ 0 ].dataIndex ];
                            return `${Match.Opponent}, ${Format_Short_Date( Match.Date )}`;
                        },
                        label: Item => {
                            const Status = Item.dataset.Status_By_Match[ Item.dataIndex ];
                            const Role = Status === "S" ? "Started" : Status === "B" ? "Subbed on" : "";
                            return `${Item.dataset.label}: ${Item.raw} ${Count_Label( Season, true )}${Role ? " (" + Role + ")" : ""}`;
                        }
                    }
                }
            }
        },
        plugins: [ Break_Line_Plugin( Season ), Legend_Gap_Plugin( Get_Break_Index( Season ) > 0 && Season.Config.Break_Label ? 18 : 0 ) ]
    } );
}


//---------------------------------------------------------------------------------------------------------------#
// Chart.js plugin: adds space under the legend, so a label drawn above the plot does not run into it
// Gap : extra pixels below the legend
//---------------------------------------------------------------------------------------------------------------#
function Legend_Gap_Plugin ( Gap ) {
    return {
        id: "Season_Legend_Gap",
        beforeInit: function ( Chart_Object ) {
            if ( !Gap || !Chart_Object.legend ) {
                return;
            }

            const Original_Fit = Chart_Object.legend.fit;

            Chart_Object.legend.fit = function () {
                Original_Fit.call( this );
                this.height += Gap;
            };
        }
    };
}


//---------------------------------------------------------------------------------------------------------------#
// Chart.js plugin: dashed vertical line and label between the last match before the break and the first after it
// Returns a Chart.js plugin object (does nothing when there is no break)
//---------------------------------------------------------------------------------------------------------------#
function Break_Line_Plugin ( Season ) {
    return {
        id: "Season_Break_Line",
        afterDatasetsDraw: function ( Chart_Object ) {
            const Break_Index = Get_Break_Index( Season );

            if ( Break_Index < 1 ) {
                return;
            }

            const X_Scale = Chart_Object.scales.x;
            const Area = Chart_Object.chartArea;
            const X = ( X_Scale.getPixelForValue( Break_Index - 1 ) + X_Scale.getPixelForValue( Break_Index ) ) / 2;
            const Context = Chart_Object.ctx;

            Context.save( );
            Context.strokeStyle = "#888888";
            Context.lineWidth = 1.5;
            Context.setLineDash( [ 4, 3 ] );
            Context.beginPath( );
            Context.moveTo( X, Area.top );
            Context.lineTo( X, Area.bottom );
            Context.stroke( );

            // Label sits above the plotting area (room made by layout padding) so it never crosses a line
            if ( Season.Config.Break_Label ) {
                Context.setLineDash( [ ] );
                Context.fillStyle = "#666666";
                Context.font = "11px sans-serif";
                Context.textAlign = "center";
                Context.fillText( Season.Config.Break_Label, X, Area.top - 5 );
            }

            Context.restore( );
        }
    };
}


//---------------------------------------------------------------------------------------------------------------#
// Index of the first match after the break
// Returns the index, or -1 when there is no break
//---------------------------------------------------------------------------------------------------------------#
function Get_Break_Index ( Season ) {
    const Has_Before = Season.Matches.some( Match => Match.Period === "before" );
    const First_After = Season.Matches.findIndex( Match => Match.Period === "after" );

    return Has_Before ? First_After : -1;
}


//---------------------------------------------------------------------------------------------------------------#
// Does a line segment between two matches cross the break
// Returns true or false
//---------------------------------------------------------------------------------------------------------------#
function Crosses_Break ( Season, From_Index, To_Index ) {
    const Break_Index = Get_Break_Index( Season );
    return Break_Index > 0 && From_Index < Break_Index && To_Index >= Break_Index;
}


//---------------------------------------------------------------------------------------------------------------#
// Find a player by full name, then by display name
// Returns the player or null
//---------------------------------------------------------------------------------------------------------------#
function Find_Season_Player ( Season, Wanted_Name ) {
    const Wanted = Normalize_Text( Wanted_Name );
    const Players = Object.values( Season.Players );

    return Players.find( Player => Normalize_Text( Player.Name ) === Wanted )
        || Players.find( Player => Normalize_Text( Player.Display ) === Wanted )
        || null;
}


//---------------------------------------------------------------------------------------------------------------#
// Chart colors from CSS variables on the chart element
// Returns an array of colors
//---------------------------------------------------------------------------------------------------------------#
function Get_Chart_Colors ( Chart_Element ) {
    const Styles = getComputedStyle( Chart_Element );
    const Defaults = [ 1, 2, 3, 4, 5, 6 ]
        .map( Number => Styles.getPropertyValue( `--SeasonChart-Color-${Number}` ).trim( ) )
        .filter( Boolean );
    const Base = Defaults.length ? Defaults : [ "#80000A", "#A8996B", "#221F1F" ];

    // colors="#00B7EB|#221F1F" on the include replaces the defaults in order
    const Overrides = ( Chart_Element.dataset.colors || "" ).split( "|" ).map( Color => Color.trim( ) ).filter( Boolean );

    return Base.map( ( Color, Index ) => Overrides[ Index ] || Color ).concat( Overrides.slice( Base.length ) );
}


//---------------------------------------------------------------------------------------------------------------#
// Colors for line charts, one per player, used in order and repeated if there are more players than colors
// From --SeasonChart-Line-1 ... -8 (site-wide); colors="#hex|#hex" on the include replaces them in order
// Returns an array of colors
//---------------------------------------------------------------------------------------------------------------#
function Get_Line_Colors ( Chart_Element ) {
    const Styles = getComputedStyle( Chart_Element );
    const Defaults = [ 1, 2, 3, 4, 5, 6, 7, 8 ]
        .map( Number => Styles.getPropertyValue( `--SeasonChart-Line-${Number}` ).trim( ) )
        .filter( Boolean );
    const Base = Defaults.length ? Defaults : [ "#00B7EB", "#E8833A", "#3A9D5D", "#6B7785", "#8E6BBF", "#D4A017", "#8C564B", "#17A589" ];
    const Overrides = ( Chart_Element.dataset.colors || "" ).split( "|" ).map( Color => Color.trim( ) ).filter( Boolean );

    return Base.map( ( Color, Index ) => Overrides[ Index ] || Color ).concat( Overrides.slice( Base.length ) );
}


//---------------------------------------------------------------------------------------------------------------#
// One named color from the CSS variables on the chart element (ex: --SeasonChart-Marker)
// Returns the color, or the fallback when the variable is not set
//---------------------------------------------------------------------------------------------------------------#
function Get_Css_Color ( Chart_Element, Name, Fallback ) {
    return getComputedStyle( Chart_Element ).getPropertyValue( Name ).trim( ) || Fallback;
}


//---------------------------------------------------------------------------------------------------------------#
// Legend above a chart: each item is { Swatch: "<svg>...</svg>", Label: "text" }
// Returns nothing
//---------------------------------------------------------------------------------------------------------------#
function Add_Legend ( Chart_Element, Items ) {
    // Layout styles are set inline so the legend reads correctly even before the site CSS is rebuilt
    const Legend = document.createElement( "div" );
    Legend.className = "SeasonChart-Legend";
    Legend.style.cssText = "display:flex;flex-wrap:wrap;gap:6px 18px;margin:0 0 12px 0;font-size:13px;line-height:1.3;color:#444;";
    Legend.innerHTML = Items.map( Item =>
        `<span style="display:inline-flex;align-items:center;gap:6px;white-space:nowrap;">` +
            `<span style="display:inline-flex;gap:2px;">${Item.Swatch}</span>${Item.Label}` +
        `</span>` ).join( "" );
    Chart_Element.insertBefore( Legend, Chart_Element.firstChild );
}


//---------------------------------------------------------------------------------------------------------------#
// Small square swatch for a legend, with an optional dot (filled or ring) or a line through it
// Returns SVG markup
//---------------------------------------------------------------------------------------------------------------#
function Legend_Swatch ( Fill, Options ) {
    const Settings = Options || { };
    let Inner = "";

    if ( Settings.Dot ) {
        Inner = `<circle cx="7" cy="7" r="3" fill="${Settings.Dot === "filled" ? Settings.Mark : "none"}" stroke="${Settings.Mark}" stroke-width="1.2"/>`;
    }

    if ( Settings.Line ) {
        Inner = `<line x1="0" x2="14" y1="7" y2="7" stroke="${Settings.Line}" stroke-width="2"/>`;
    }

    if ( Settings.Dashed ) {
        Inner = `<line x1="7" x2="7" y1="0" y2="14" stroke="${Settings.Dashed}" stroke-width="1.5" stroke-dasharray="3 2"/>`;
    }

    return `<svg width="14" height="14" viewBox="0 0 14 14" style="display:block;flex:none;"><rect width="14" height="14" rx="2" fill="${Fill}"/>${Inner}</svg>`;
}


//---------------------------------------------------------------------------------------------------------------#
// Note under the chart when matches were skipped for a real problem (missing lineup, broken file)
// Matches skipped only for having no notes file are left out of the note
// Returns nothing
//---------------------------------------------------------------------------------------------------------------#
function Show_Skipped_Note ( Chart_Element, Season ) {
    const Note = Chart_Element.querySelector( ".SeasonChart-Note" );
    const Problems = Season.Skipped.filter( Item => !Item.Quiet );

    if ( !Note || !Problems.length ) {
        return;
    }

    const Count = Problems.length;
    Note.textContent = `${Count} match${Count === 1 ? "" : "es"} skipped (missing or unreadable files).`;
    Note.title = Problems.map( Item => `${Item.Folder}: ${Item.Reason}` ).join( "\n" );
    Note.hidden = false;
}


//---------------------------------------------------------------------------------------------------------------#
// The word for what is being counted, from count_label on Season_Data.html (ex: "Impressions"); default "Notes"
// Returns text, lowercase when Lower is true
//---------------------------------------------------------------------------------------------------------------#
function Count_Label ( Season, Lower ) {
    const Label = ( Season.Config && Season.Config.Count_Label ) || "Notes";
    return Lower ? Label.toLowerCase( ) : Label;
}


//---------------------------------------------------------------------------------------------------------------#
// "2026-09-05" -> "Sep 5"
// Returns text
//---------------------------------------------------------------------------------------------------------------#
function Format_Short_Date ( Date_Text ) {
    return new Date( Date_Text + "T12:00:00" ).toLocaleDateString( "en-US", { month: "short", day: "numeric" } );
}


//===============================================================================================================#
// Shared helpers for the charts below
//===============================================================================================================#

//---------------------------------------------------------------------------------------------------------------#
// Lookups used by most charts: appearance by match+player, note count by match+player, totals by player
// Returns { Appearance, Note_Count, Player_Total }
//---------------------------------------------------------------------------------------------------------------#
function Build_Season_Lookups ( Season ) {
    const Appearance = { };
    const Note_Count = { };
    const Player_Total = { };

    for ( const Item of Season.Appearances ) {
        Appearance[ Item.Match + "|" + Item.Player ] = Item;
    }

    for ( const Note of Season.Notes ) {
        const Key = Note.Match + "|" + Note.Player;
        Note_Count[ Key ] = ( Note_Count[ Key ] || 0 ) + 1;
        Player_Total[ Note.Player ] = ( Player_Total[ Note.Player ] || 0 ) + 1;
    }

    return { Appearance, Note_Count, Player_Total };
}


//---------------------------------------------------------------------------------------------------------------#
// Did the player get on the field (started or subbed on)
// Returns true or false
//---------------------------------------------------------------------------------------------------------------#
function Is_On_Field ( Appearance ) {
    return !!Appearance && ( Appearance.Status === "S" || Appearance.Status === "B" );
}


//---------------------------------------------------------------------------------------------------------------#
// Minutes on the field for one appearance: starters from 0, subs from their on minute, to the off minute or 90
// Returns minutes, or null when the on minute is unknown
//---------------------------------------------------------------------------------------------------------------#
function Get_On_Minute ( Appearance ) {
    const On = Appearance.Status === "S" ? 0 : Appearance.On;
    return On === null || On === undefined ? null : On;
}


//---------------------------------------------------------------------------------------------------------------#
// Split players into groups by the season break: before and after, before only, after only
// With no break in the config, everyone is one group
// Returns [ [ Label, [ Player_Ids ] ], ... ]
//---------------------------------------------------------------------------------------------------------------#
function Group_Players_By_Break ( Season, Player_Ids, Is_Present ) {
    if ( Get_Break_Index( Season ) < 1 ) {
        return [ [ "", Player_Ids ] ];
    }

    const Before = Player_Id => Season.Matches.some( Match => Match.Period === "before" && Is_Present( Match, Player_Id ) );
    const After  = Player_Id => Season.Matches.some( Match => Match.Period === "after" && Is_Present( Match, Player_Id ) );
    const Break_Name = Season.Config.Break_Label || "break";

    // ex: break_label="World Cup Break" -> "Played Before and After the World Cup Break"
    return [
        [ `Played Before and After the ${Break_Name}`, Player_Ids.filter( Id => Before( Id ) && After( Id ) ) ],
        [ `Played only Before the ${Break_Name}`,      Player_Ids.filter( Id => Before( Id ) && !After( Id ) ) ],
        [ `Played only After the ${Break_Name}`,       Player_Ids.filter( Id => !Before( Id ) && After( Id ) ) ]
    ].filter( Group => Group[ 1 ].length );
}


//---------------------------------------------------------------------------------------------------------------#
// Swap the chart's canvas for an SVG inside a sideways-scrolling box (for the grids)
// Returns the SVG element
//---------------------------------------------------------------------------------------------------------------#
function Prepare_Svg ( Chart_Element, Width, Height ) {
    const Wrap = Chart_Element.querySelector( ".SeasonChart-Canvas_Wrap" );
    Wrap.innerHTML = "";
    Wrap.className = "SeasonChart-Scroll";

    return Svg_Element( "svg", { viewBox: `0 0 ${Width} ${Height}`, width: Width, height: Height }, Wrap );
}


//---------------------------------------------------------------------------------------------------------------#
// Create an SVG element with attributes, optionally adding it to a parent
// Returns the element
//---------------------------------------------------------------------------------------------------------------#
function Svg_Element ( Tag, Attributes, Parent ) {
    const Element = document.createElementNS( "http://www.w3.org/2000/svg", Tag );

    for ( const Name in Attributes ) {
        Element.setAttribute( Name, Attributes[ Name ] );
    }

    if ( Parent ) {
        Parent.appendChild( Element );
    }

    return Element;
}


//---------------------------------------------------------------------------------------------------------------#
// Add SVG text
// Returns the text element
//---------------------------------------------------------------------------------------------------------------#
function Svg_Text ( Parent, X, Y, Text, Attributes ) {
    const Element = Svg_Element( "text", Object.assign( { x: X, y: Y, "font-size": 11, fill: "#333333" }, Attributes || { } ), Parent );
    Element.textContent = Text;
    return Element;
}


//---------------------------------------------------------------------------------------------------------------#
// Hover tooltip for SVG shapes (one shared tooltip box per page)
// Returns nothing
//---------------------------------------------------------------------------------------------------------------#
function Svg_Hover ( Element, Html ) {
    let Tooltip = document.querySelector( ".SeasonChart-Tooltip" );

    if ( !Tooltip ) {
        Tooltip = document.createElement( "div" );
        Tooltip.className = "SeasonChart-Tooltip";
        Tooltip.hidden = true;
        document.body.appendChild( Tooltip );
    }

    Element.addEventListener( "mousemove", Event_Object => {
        Tooltip.innerHTML = Html;
        Tooltip.hidden = false;
        Tooltip.style.left = Math.min( Event_Object.clientX + 12, window.innerWidth - 280 ) + "px";
        Tooltip.style.top = ( Event_Object.clientY + 12 ) + "px";
    } );

    Element.addEventListener( "mouseleave", ( ) => { Tooltip.hidden = true; } );
}


//---------------------------------------------------------------------------------------------------------------#
// Grid layout sizes for a season
// Returns the layout object
//---------------------------------------------------------------------------------------------------------------#
function Grid_Layout ( Season, Groups, Accent ) {
    const Layout = { Left: 96, Top: 70, Cell_Width: 24, Cell_Height: 19, Gap: 14, Group_Height: 30, Accent: Accent };
    const Group_Count = Groups.filter( Group => Group[ 0 ] ).length;
    const Row_Count = Groups.reduce( ( Sum, Group ) => Sum + Group[ 1 ].length, 0 );

    Layout.Width = Layout.Left + Season.Matches.length * Layout.Cell_Width + Layout.Gap + 10;
    Layout.Height = Layout.Top + Group_Count * Layout.Group_Height + Row_Count * Layout.Cell_Height + 10;
    return Layout;
}


//---------------------------------------------------------------------------------------------------------------#
// Draw the shared grid frame: rotated date labels, the break line, and group headings with player names
// Returns { X, Rows: [ { Player_Id, Y } ] } where X( Match_Index ) gives a column's left edge
//---------------------------------------------------------------------------------------------------------------#
function Draw_Grid_Frame ( Svg, Season, Groups, Layout ) {
    const Break_Index = Get_Break_Index( Season );
    const X = Index => Layout.Left + Index * Layout.Cell_Width + ( Break_Index > 0 && Index >= Break_Index ? Layout.Gap : 0 );
    const Rows = [ ];

    Season.Matches.forEach( ( Match, Index ) => {
        Svg_Text( Svg, 0, 0, Format_Short_Date( Match.Date ), {
            fill: "#666666", "font-size": 10,
            transform: `translate(${X( Index ) + Layout.Cell_Width / 2 + 3},${Layout.Top - 6}) rotate(-60)`
        } );
    } );

    let Y = Layout.Top;

    for ( const [ Label, Player_Ids ] of Groups ) {
        if ( Label ) {
            Svg_Text( Svg, 4, Y + Layout.Group_Height - 9, `${Label} (${Player_Ids.length})`, { "font-size": 12, "font-weight": 600, fill: Layout.Accent } );
            Svg_Element( "line", { x1: 4, x2: Layout.Width - 10, y1: Y + Layout.Group_Height - 4, y2: Y + Layout.Group_Height - 4, stroke: "#dddddd" }, Svg );
            Y += Layout.Group_Height;
        }

        for ( const Player_Id of Player_Ids ) {
            Svg_Text( Svg, Layout.Left - 8, Y + Layout.Cell_Height / 2 + 4, Season.Players[ Player_Id ].Display, { "text-anchor": "end" } );
            Rows.push( { Player_Id, Y } );
            Y += Layout.Cell_Height;
        }
    }

    if ( Break_Index > 0 ) {
        const Break_X = X( Break_Index ) - Layout.Gap / 2;
        Svg_Element( "line", { x1: Break_X, x2: Break_X, y1: 4, y2: Y + 4, stroke: Layout.Break_Color || "#888888", "stroke-width": 1.5, "stroke-dasharray": "4 3" }, Svg );

        // Label starts just right of the line so the full text always shows
        if ( Season.Config.Break_Label ) {
            Svg_Text( Svg, Break_X + 4, 12, Season.Config.Break_Label, { fill: "#666666", "font-size": 10 } );
        }
    }

    return { X, Rows };
}


//---------------------------------------------------------------------------------------------------------------#
// "#80000A" -> "rgba(128, 0, 10, 0.5)"
// Returns text
//---------------------------------------------------------------------------------------------------------------#
function Color_With_Alpha ( Color, Alpha ) {
    const [ Red, Green, Blue ] = Color_To_Rgb( Color );
    return `rgba(${Red}, ${Green}, ${Blue}, ${Alpha})`;
}


//---------------------------------------------------------------------------------------------------------------#
// "#80000A" or "cyan" -> [ 128, 0, 10 ]
// Returns [ Red, Green, Blue ]
//---------------------------------------------------------------------------------------------------------------#
function Color_To_Rgb ( Color ) {
    let Hex = Color;

    // Named colors (ex: "cyan") are converted to hex by the browser
    if ( !/^#/.test( Hex ) ) {
        const Context = document.createElement( "canvas" ).getContext( "2d" );
        Context.fillStyle = Hex;
        Hex = Context.fillStyle;
    }

    const Clean = Hex.replace( "#", "" );
    const Full = Clean.length === 3 ? Clean.split( "" ).map( Character => Character + Character ).join( "" ) : Clean;
    const Value = parseInt( Full, 16 );
    return [ ( Value >> 16 ) & 255, ( Value >> 8 ) & 255, Value & 255 ];
}


//---------------------------------------------------------------------------------------------------------------#
// A color along a two-color scale. Position 0 = the "fewer" color, 1 = the "more" color
// The square root spreads out the low end, where most counts are
// Returns [ Red, Green, Blue ]
//---------------------------------------------------------------------------------------------------------------#
function Scale_Color ( Fewer_Color, More_Color, Position ) {
    const Spread = Math.sqrt( Math.max( 0, Math.min( 1, Position ) ) );
    const Fewer = Color_To_Rgb( Fewer_Color );
    const More = Color_To_Rgb( More_Color );

    return Fewer.map( ( Value, Index ) => Math.round( Value + ( More[ Index ] - Value ) * Spread ) );
}


//---------------------------------------------------------------------------------------------------------------#
// [ 52, 84, 122 ] -> "rgb(52, 84, 122)"
// Returns text
//---------------------------------------------------------------------------------------------------------------#
function Rgb_Text ( Rgb ) {
    return `rgb(${Rgb.join( ", " )})`;
}


//---------------------------------------------------------------------------------------------------------------#
// Is a color dark enough that a light marker reads better on it
// Returns true or false
//---------------------------------------------------------------------------------------------------------------#
function Is_Dark_Color ( Rgb ) {
    return ( 0.299 * Rgb[ 0 ] + 0.587 * Rgb[ 1 ] + 0.114 * Rgb[ 2 ] ) < 140;
}


//---------------------------------------------------------------------------------------------------------------#
// Chart.js plugin: labels centered above stretches of category columns (ex: "1st Half" over columns 0-9)
// Sections : [ { Label, First, Last } ] - First and Last are column indexes
//---------------------------------------------------------------------------------------------------------------#
function Section_Labels_Plugin ( Plugin_Id, Sections ) {
    return {
        id: Plugin_Id,
        afterDatasetsDraw: function ( Chart_Object ) {
            const X_Scale = Chart_Object.scales.x;
            const Area = Chart_Object.chartArea;
            const Context = Chart_Object.ctx;

            Context.save( );
            Context.fillStyle = "#666666";
            Context.font = "11px sans-serif";
            Context.textAlign = "center";

            for ( const Section of Sections ) {
                const X = ( X_Scale.getPixelForValue( Section.First ) + X_Scale.getPixelForValue( Section.Last ) ) / 2;
                Context.fillText( Section.Label, X, Area.top - 5 );
            }

            Context.restore( );
        }
    };
}


//---------------------------------------------------------------------------------------------------------------#
// Chart.js plugin: a dashed vertical line with a label between two category columns
// Returns a Chart.js plugin object (does nothing when Index < 1)
//---------------------------------------------------------------------------------------------------------------#
function Vertical_Line_Plugin ( Plugin_Id, Index, Label ) {
    return {
        id: Plugin_Id,
        afterDatasetsDraw: function ( Chart_Object ) {
            if ( Index < 1 ) {
                return;
            }

            const X_Scale = Chart_Object.scales.x;
            const Area = Chart_Object.chartArea;
            const X = ( X_Scale.getPixelForValue( Index - 1 ) + X_Scale.getPixelForValue( Index ) ) / 2;
            const Context = Chart_Object.ctx;

            Context.save( );
            Context.strokeStyle = "#888888";
            Context.lineWidth = 1.5;
            Context.setLineDash( [ 4, 3 ] );
            Context.beginPath( );
            Context.moveTo( X, Area.top );
            Context.lineTo( X, Area.bottom );
            Context.stroke( );

            if ( Label ) {
                Context.setLineDash( [ ] );
                Context.fillStyle = "#666666";
                Context.font = "11px sans-serif";
                Context.textAlign = "center";
                Context.fillText( Label, X, Area.top - 4 );
            }

            Context.restore( );
        }
    };
}


//---------------------------------------------------------------------------------------------------------------#
// Set the canvas box height (bar charts grow with the number of players)
// Returns nothing
//---------------------------------------------------------------------------------------------------------------#
function Set_Canvas_Height ( Chart_Element, Height ) {
    Chart_Element.querySelector( ".SeasonChart-Canvas_Wrap" ).style.height = Height + "px";
}


//===============================================================================================================#
// chart="notes_grid" - players x matches, shaded by how many notes; filled dot = started, ring = subbed on
// Rows grouped by the break, sorted alphabetically
//===============================================================================================================#
function Render_Notes_Grid ( Chart_Element, Season ) {
    const Lookups = Build_Season_Lookups( Season );
    const Colors = Get_Chart_Colors( Chart_Element );
    const Is_Present = ( Match, Player_Id ) => Is_On_Field( Lookups.Appearance[ Match.Index + "|" + Player_Id ] )
                                             || ( Lookups.Note_Count[ Match.Index + "|" + Player_Id ] || 0 ) > 0;

    const First_Seen = { };
    const Player_Ids = Object.keys( Season.Players ).filter( Player_Id => {
        First_Seen[ Player_Id ] = Season.Matches.findIndex( Match => Is_Present( Match, Player_Id ) );
        return First_Seen[ Player_Id ] >= 0;
    } );

    const Groups = Group_Players_By_Break( Season, Player_Ids, Is_Present );
    // Alphabetical by display name within each group; accents are ignored (Báez sorts with B)
    Groups.forEach( Group => Group[ 1 ].sort( ( A, B ) =>
        Season.Players[ A ].Display.localeCompare( Season.Players[ B ].Display, "en", { sensitivity: "base" } ) ) );

    const Most_Notes = Math.max( 1, ...Object.values( Lookups.Note_Count ) );
    const Empty_Color = Get_Css_Color( Chart_Element, "--SeasonChart-Empty", "#eeeeee" );
    const Marker_Color = Get_Css_Color( Chart_Element, "--SeasonChart-Marker", "#222222" );
    const Marker_On_Dark = Get_Css_Color( Chart_Element, "--SeasonChart-Marker_On_Dark", "#ffffff" );

    // Note shading runs from the "fewer" color to the "more" color (color_fewer / color_more on the include)
    const Fewer_Color = Chart_Element.dataset.colorFewer || Get_Css_Color( Chart_Element, "--SeasonChart-Scale_Fewer", "#34547A" );
    const More_Color = Chart_Element.dataset.colorMore || Get_Css_Color( Chart_Element, "--SeasonChart-Scale_More", "#00B7EB" );
    const Shade = Count => Scale_Color( Fewer_Color, More_Color, ( Count - 1 ) / Math.max( 1, Most_Notes - 1 ) );
    const Mark_For = Rgb => Rgb && Is_Dark_Color( Rgb ) ? Marker_On_Dark : Marker_Color;

    const Layout = Grid_Layout( Season, Groups, Get_Css_Color( Chart_Element, "--SeasonChart-Label", Colors[ 0 ] ) );
    Layout.Break_Color = Get_Css_Color( Chart_Element, "--SeasonChart-Break", "#888888" );

    const Sample = Shade( Math.ceil( Most_Notes / 2 ) );
    const Scale_Swatches = [ 0, 0.25, 0.5, 0.75, 1 ]
        .map( Position => Legend_Swatch( Rgb_Text( Scale_Color( Fewer_Color, More_Color, Position ) ) ) )
        .join( "" );

    Add_Legend( Chart_Element, [
        { Swatch: Legend_Swatch( Rgb_Text( Sample ), { Dot: "filled", Mark: Mark_For( Sample ) } ), Label: "Started" },
        { Swatch: Legend_Swatch( Rgb_Text( Sample ), { Dot: "ring", Mark: Mark_For( Sample ) } ), Label: "Subbed On" },
        { Swatch: Scale_Swatches, Label: `Fewer -> More Match-Day ${Count_Label( Season, true )}` }
        //{ Swatch: Legend_Swatch( Empty_Color ), Label: "no notes" }
    ] );

    const Svg = Prepare_Svg( Chart_Element, Layout.Width, Layout.Height );
    const Frame = Draw_Grid_Frame( Svg, Season, Groups, Layout );

    for ( const Row of Frame.Rows ) {
        const Player = Season.Players[ Row.Player_Id ];

        Season.Matches.forEach( ( Match, Index ) => {
            const Key = Match.Index + "|" + Row.Player_Id;
            const Count = Lookups.Note_Count[ Key ] || 0;
            const Appearance = Lookups.Appearance[ Key ];
            const X = Frame.X( Index );

            const Cell_Rgb = Count ? Shade( Count ) : null;
            const Mark = Mark_For( Cell_Rgb );

            const Cell = Svg_Element( "rect", {
                x: X + 1, y: Row.Y + 1, width: Layout.Cell_Width - 2, height: Layout.Cell_Height - 2, rx: 2,
                fill: Cell_Rgb ? Rgb_Text( Cell_Rgb ) : Empty_Color
            }, Svg );

            if ( Is_On_Field( Appearance ) ) {
                Svg_Element( "circle", {
                    cx: X + Layout.Cell_Width / 2, cy: Row.Y + Layout.Cell_Height / 2, r: 3,
                    fill: Appearance.Status === "S" ? Mark : "none", stroke: Mark, "stroke-width": 1.2, "pointer-events": "none"
                }, Svg );
            }

            const Role = Appearance ? { S: "started", B: "off the bench", U: "unused sub", X: "unavailable" }[ Appearance.Status ] : "";
            Svg_Hover( Cell, `<b>${Player.Display}</b> vs ${Match.Opponent}, ${Format_Short_Date( Match.Date )}<br>${Count} ${Count_Label( Season, true )}${Role ? " · " + Role : ""}` );
        } );
    }
}


//===============================================================================================================#
// chart="availability_grid" - only the matches a player missed are marked
// Thin line = time with the team. Color 2 = out with a reason listed. Grey = not in the squad, no reason listed
// Rows grouped by the break, alphabetical within each group
//===============================================================================================================#
function Render_Availability_Grid ( Chart_Element, Season ) {
    const Lookups = Build_Season_Lookups( Season );
    const Colors = Get_Chart_Colors( Chart_Element );

    // Time with the team: first to last match listed in any squad or availability list
    const Span = { };

    for ( const Item of Season.Appearances ) {
        const Range = Span[ Item.Player ] || ( Span[ Item.Player ] = [ Item.Match, Item.Match ] );
        Range[ 0 ] = Math.min( Range[ 0 ], Item.Match );
        Range[ 1 ] = Math.max( Range[ 1 ], Item.Match );
    }

    const Player_Ids = Object.keys( Span ).filter( Player_Id =>
        Season.Players[ Player_Id ] && Season.Appearances.some( Item => Item.Player === Player_Id && Is_On_Field( Item ) ) );
    const Is_Present = ( Match, Player_Id ) => Match.Index >= Span[ Player_Id ][ 0 ] && Match.Index <= Span[ Player_Id ][ 1 ];

    const Missed = { };

    for ( const Player_Id of Player_Ids ) {
        Missed[ Player_Id ] = 0;

        for ( let Index = Span[ Player_Id ][ 0 ]; Index <= Span[ Player_Id ][ 1 ]; Index++ ) {
            const Appearance = Lookups.Appearance[ Index + "|" + Player_Id ];

            if ( !Appearance || Appearance.Status === "X" ) {
                Missed[ Player_Id ]++;
            }
        }
    }

    const Groups = Group_Players_By_Break( Season, Player_Ids, Is_Present );
    Groups.forEach( Group => Group[ 1 ].sort( ( A, B ) =>
        Season.Players[ A ].Display.localeCompare( Season.Players[ B ].Display, "en", { sensitivity: "base" } ) ) );

    const Out_Color = Chart_Element.dataset.colorOut || Colors[ 1 ] || "#A8996B";
    const Missing_Color = Chart_Element.dataset.colorMissing || Get_Css_Color( Chart_Element, "--SeasonChart-Missing", "#999999" );
    const Tenure_Color = Chart_Element.dataset.colorTenure || Get_Css_Color( Chart_Element, "--SeasonChart-Tenure", "#dddddd" );
    const Layout = Grid_Layout( Season, Groups, Get_Css_Color( Chart_Element, "--SeasonChart-Label", Colors[ 0 ] ) );
    Layout.Break_Color = Get_Css_Color( Chart_Element, "--SeasonChart-Break", "#888888" );

    Add_Legend( Chart_Element, [
        { Swatch: Legend_Swatch( Out_Color ), Label: "Out, Reason Listed (Hover for the Reason)" },
        { Swatch: Legend_Swatch( Missing_Color ), Label: "Not in the Matchday Squad, No Reason Listed" },
        { Swatch: Legend_Swatch( "transparent", { Line: Tenure_Color } ), Label: "A Player for the Club" }
    ] );

    const Svg = Prepare_Svg( Chart_Element, Layout.Width, Layout.Height );
    const Frame = Draw_Grid_Frame( Svg, Season, Groups, Layout );

    for ( const Row of Frame.Rows ) {
        const Player = Season.Players[ Row.Player_Id ];
        const [ First, Last ] = Span[ Row.Player_Id ];

        Svg_Element( "line", {
            x1: Frame.X( First ) + 2, x2: Frame.X( Last ) + Layout.Cell_Width - 2,
            y1: Row.Y + Layout.Cell_Height / 2, y2: Row.Y + Layout.Cell_Height / 2, stroke: Tenure_Color, "stroke-width": 2
        }, Svg );

        for ( let Index = First; Index <= Last; Index++ ) {
            const Match = Season.Matches[ Index ];
            const Appearance = Lookups.Appearance[ Index + "|" + Row.Player_Id ];
            let Fill = "transparent";
            let Label;

            if ( Appearance && [ "S", "B", "U" ].includes( Appearance.Status ) ) {
                Label = "in the squad: " + { S: "started", B: "subbed on", U: "unused sub" }[ Appearance.Status ];
            }
            else if ( Appearance && Appearance.Status === "X" ) {
                Fill = Out_Color;
                Label = "out: " + ( Appearance.Reason || "no reason given" );
            }
            else {
                Fill = Missing_Color;
                Label = "not in matchday squad, no reason listed";
            }

            const Cell = Svg_Element( "rect", {
                x: Frame.X( Index ) + 1, y: Row.Y + 1, width: Layout.Cell_Width - 2, height: Layout.Cell_Height - 2, rx: 2, fill: Fill
            }, Svg );

            Svg_Hover( Cell, `<b>${Player.Display}</b> vs ${Match.Opponent}, ${Format_Short_Date( Match.Date )}<br>${Label}` );
        }
    }
}


//===============================================================================================================#
// chart="start_vs_bench" - impressions per 90 minutes on the field (per_minutes), as a starter and off the bench
// A rate, not a season total: the player's count divided by his minutes, times per_minutes
// Only players with at least min_starts starts and min_subs sub appearances (defaults 2 and 2)
// Minutes come from the lineup sub times; a full match counts as 90
// Colors: color_starter / color_bench on the include, or --SeasonChart-Starter / --SeasonChart-Bench
//===============================================================================================================#
function Render_Start_Vs_Bench_Chart ( Chart_Element, Season ) {
    const Lookups = Build_Season_Lookups( Season );
    const Min_Starts = parseInt( Chart_Element.dataset.minStarts, 10 ) || 2;
    const Min_Subs = parseInt( Chart_Element.dataset.minSubs, 10 ) || 2;
    const Per_Minutes = parseInt( Chart_Element.dataset.perMinutes, 10 ) || 90;
    const Starter_Color = Chart_Element.dataset.colorStarter || Get_Css_Color( Chart_Element, "--SeasonChart-Starter", "#7B5EA7" );
    const Bench_Color = Chart_Element.dataset.colorBench || Get_Css_Color( Chart_Element, "--SeasonChart-Bench", "#00B7EB" );
    const Label = Count_Label( Season );
    const Label_Lower = Count_Label( Season, true );
    const Totals = { };

    for ( const Item of Season.Appearances ) {
        const On = Is_On_Field( Item ) ? Get_On_Minute( Item ) : null;

        if ( On === null ) {
            continue;
        }

        const Total = Totals[ Item.Player ] || ( Totals[ Item.Player ] = { S: { Count: 0, Notes: 0, Minutes: 0 }, B: { Count: 0, Notes: 0, Minutes: 0 } } );
        const Role = Total[ Item.Status ];

        Role.Count++;
        Role.Minutes += Math.max( ( Item.Off ?? 90 ) - On, 1 );
        Role.Notes += Lookups.Note_Count[ Item.Match + "|" + Item.Player ] || 0;
    }

    const Rows = Object.entries( Totals )
        .filter( ( [ Player_Id, Total ] ) => Season.Players[ Player_Id ] && Total.S.Count >= Min_Starts && Total.B.Count >= Min_Subs )
        .map( ( [ Player_Id, Total ] ) => ( {
            Player: Season.Players[ Player_Id ],
            Total: Total,
            Start_Rate: Total.S.Notes / Total.S.Minutes * Per_Minutes,
            Bench_Rate: Total.B.Notes / Total.B.Minutes * Per_Minutes
        } ) )
        .sort( ( A, B ) => ( B.Bench_Rate - B.Start_Rate ) - ( A.Bench_Rate - A.Start_Rate ) );

    Set_Canvas_Height( Chart_Element, Rows.length * 38 + 70 );

    const Describe = ( Role, Role_Label ) => `${Role_Label}: ${Role.Count} matches, ${Role.Minutes} min, ${Role.Notes} ${Label_Lower}`;

    new Chart( Chart_Element.querySelector( "canvas" ), {
        type: "bar",
        data: {
            labels: Rows.map( Row => Row.Player.Display ),
            datasets: [
                { label: "Starter", data: Rows.map( Row => +Row.Start_Rate.toFixed( 1 ) ), backgroundColor: Starter_Color },
                { label: "Off the Bench", data: Rows.map( Row => +Row.Bench_Rate.toFixed( 1 ) ), backgroundColor: Bench_Color }
            ]
        },
        options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            scales: { x: { beginAtZero: true, title: { display: true, text: `Average ${Label} per ${Per_Minutes} minutes` } } },
            plugins: {
                legend: { position: "top" },
                tooltip: {
                    callbacks: {
                        label: Item => `${Item.dataset.label}: ${Item.raw} per ${Per_Minutes} min`,
                        afterBody: Items => {
                            const Row = Rows[ Items[ 0 ].dataIndex ];
                            return [ Describe( Row.Total.S, "Starts" ), Describe( Row.Total.B, "Off the Bench" ) ];
                        }
                    }
                }
            }
        }
    } );
}


//===============================================================================================================#
// chart="minute_buckets" - average notes per 5 minutes of match time
// Grey line: any player on the field at that point. Color 1 line: the player picked in the dropdown
// A player's line counts only matches where he was on the field in that stretch;
// stretches with fewer than min_matches matches (default 5) are dashed
// 45+ and 90+ hold all stoppage time
//===============================================================================================================#
function Render_Minute_Buckets_Chart ( Chart_Element, Season ) {
    const Player_Color = Chart_Element.dataset.colorPlayer || Get_Css_Color( Chart_Element, "--SeasonChart-Player", "#00B7EB" );
    const Average_Color = Chart_Element.dataset.colorAverage || Get_Css_Color( Chart_Element, "--SeasonChart-All_Players", "#999999" );
    const Min_Matches = parseInt( Chart_Element.dataset.minMatches, 10 ) || 5;
    const Empty = ( ) => ( { Notes: Array( 20 ).fill( 0 ), Matches: Array( 20 ).fill( 0 ) } );
    const By_Player = { };
    const All = Empty( );

    const Note_Bucket = ( Half, Minute ) => Half === 1
        ? Math.min( Math.floor( Math.max( Minute, 0 ) / 5 ), 9 )
        : 10 + Math.min( Math.floor( ( Math.max( Minute, 45 ) - 45 ) / 5 ), 9 );
    const Clock_Bucket = Minute => Minute < 45 ? Note_Bucket( 1, Minute ) : Note_Bucket( 2, Minute );

    for ( const Note of Season.Notes ) {
        if ( Note.Minute === null ) {
            continue;
        }

        const Bucket = Note_Bucket( Note.Half, Note.Minute );
        ( By_Player[ Note.Player ] || ( By_Player[ Note.Player ] = Empty( ) ) ).Notes[ Bucket ]++;
        All.Notes[ Bucket ]++;
    }

    for ( const Item of Season.Appearances ) {
        const On = Is_On_Field( Item ) ? Get_On_Minute( Item ) : null;

        if ( On === null ) {
            continue;
        }

        const First = Clock_Bucket( On );
        const Last = Item.Off === null || Item.Off === undefined ? 19 : Clock_Bucket( Item.Off );
        const Player = By_Player[ Item.Player ] || ( By_Player[ Item.Player ] = Empty( ) );

        for ( let Bucket = First; Bucket <= Last; Bucket++ ) {
            Player.Matches[ Bucket ]++;
            All.Matches[ Bucket ]++;
        }
    }

    const Rate = Data => Data.Notes.map( ( Count, Bucket ) => Data.Matches[ Bucket ] ? +( Count / Data.Matches[ Bucket ] ).toFixed( 2 ) : null );

    // Player picker: everyone with enough time on the field, alphabetical
    const Player_Ids = Object.keys( By_Player )
        .filter( Player_Id => Season.Players[ Player_Id ] && By_Player[ Player_Id ].Matches.some( Count => Count >= Min_Matches ) )
        .sort( ( A, B ) => Season.Players[ A ].Display.localeCompare( Season.Players[ B ].Display, "en", { sensitivity: "base" } ) );

    if ( !Player_Ids.length ) {
        return;
    }

    const Picker_Label = document.createElement( "label" );
    Picker_Label.className = "SeasonChart-Picker";
    Picker_Label.textContent = "Player ";

    const Picker = document.createElement( "select" );
    Picker.innerHTML = Player_Ids.map( Player_Id => `<option value="${Player_Id}">${Season.Players[ Player_Id ].Display}</option>` ).join( "" );
    Picker_Label.appendChild( Picker );
    Chart_Element.insertBefore( Picker_Label, Chart_Element.firstChild );

    const Wanted = ( Chart_Element.dataset.players || "" ).split( "|" )[ 0 ];
    const Wanted_Player = Wanted ? Find_Season_Player( Season, Wanted ) : null;

    if ( Wanted_Player && Player_Ids.includes( Wanted_Player.Id ) ) {
        Picker.value = Wanted_Player.Id;
    }

    const Hide_Halftime = Segment => Segment.p0DataIndex === 9 ? "transparent" : undefined;

    const Player_Dataset = Player_Id => {
        const Data = By_Player[ Player_Id ];

        return {
            label: Season.Players[ Player_Id ].Display,
            data: Rate( Data ),
            Matches: Data.Matches,
            Notes: Data.Notes,
            borderColor: Player_Color,
            backgroundColor: Player_Color,
            borderWidth: 2.5,
            pointRadius: Context => Data.Matches[ Context.dataIndex ] >= Min_Matches ? 4 : 2,
            spanGaps: false,
            segment: {
                borderDash: Segment => Data.Matches[ Segment.p0DataIndex ] < Min_Matches || Data.Matches[ Segment.p1DataIndex ] < Min_Matches ? [ 4, 4 ] : undefined,
                borderColor: Hide_Halftime
            }
        };
    };

    const Chart_Object = new Chart( Chart_Element.querySelector( "canvas" ), {
        type: "line",
        data: {
            labels: Season_Bucket_Labels,
            datasets: [
                {
                    label: "Team average",
                    data: Rate( All ),
                    Matches: All.Matches,
                    Notes: All.Notes,
                    borderColor: Average_Color,
                    backgroundColor: Average_Color,
                    borderWidth: 2,
                    pointRadius: 3,
                    segment: { borderColor: Hide_Halftime }
                },
                Player_Dataset( Picker.value )
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, title: { display: true, text: `${Count_Label( Season )} per 5 minutes` } },
                x: { title: { display: true, text: "Match minute" } }
            },
            plugins: {
                legend: { position: "top" },
                tooltip: {
                    callbacks: {
                        title: Items => `Minute ${Items[ 0 ].label}`,
                        label: Item => {
                            const Matches = Item.dataset.Matches[ Item.dataIndex ];
                            const Notes = Item.dataset.Notes[ Item.dataIndex ];

                            return Item.datasetIndex === 0
                                ? `Team average: ${Item.raw} per player on the field`
                                : `${Item.dataset.label}: ${Item.raw} per match (${Notes} ${Count_Label( Season, true )} in ${Matches} matches)`;
                        }
                    }
                }
            }
        },
        plugins: [
            Vertical_Line_Plugin( "Season_Halftime_Line", 10, "" ),
            Section_Labels_Plugin( "Season_Half_Labels", [ { Label: "1st Half", First: 0, Last: 9 }, { Label: "2nd Half", First: 10, Last: 19 } ] ),
            Legend_Gap_Plugin( 18 )
        ]
    } );

    // Note under the chart, shown only when the picked player has dashed stretches
    const Dashed_Note = document.createElement( "p" );
    Dashed_Note.className = "SeasonChart-Note";
    Chart_Element.appendChild( Dashed_Note );

    const Update_Dashed_Note = Player_Id => {
        const Has_Dashed = By_Player[ Player_Id ].Matches.some( Count => Count < Min_Matches );
        Dashed_Note.hidden = !Has_Dashed;
        Dashed_Note.textContent = Has_Dashed
            ? `Dashed: ${Season.Players[ Player_Id ].Display} was on the field in fewer than ${Min_Matches} matches at those minutes.`
            : "";
    };

    Update_Dashed_Note( Picker.value );

    Picker.addEventListener( "change", ( ) => {
        Chart_Object.data.datasets[ 1 ] = Player_Dataset( Picker.value );
        Chart_Object.update( );
        Update_Dashed_Note( Picker.value );
    } );
}


//===============================================================================================================#
// chart="halves" - season notes in the 1st half vs the 2nd half, two bars per player
// The top players by total notes (top, default 16), sorted by the change from 1st to 2nd half
//===============================================================================================================#
function Render_Halves_Chart ( Chart_Element, Season ) {
    const Lookups = Build_Season_Lookups( Season );
    const Colors = Get_Chart_Colors( Chart_Element );
    const Top = parseInt( Chart_Element.dataset.top, 10 ) || 16;
    const Halves = { };

    for ( const Note of Season.Notes ) {
        const Counts = Halves[ Note.Player ] || ( Halves[ Note.Player ] = [ 0, 0 ] );
        Counts[ Note.Half - 1 ]++;
    }

    const Player_Ids = Object.keys( Halves )
        .filter( Player_Id => Season.Players[ Player_Id ] )
        .sort( ( A, B ) => ( Lookups.Player_Total[ B ] || 0 ) - ( Lookups.Player_Total[ A ] || 0 ) )
        .slice( 0, Top )
        .sort( ( A, B ) => ( Halves[ B ][ 1 ] - Halves[ B ][ 0 ] ) - ( Halves[ A ][ 1 ] - Halves[ A ][ 0 ] ) );

    Set_Canvas_Height( Chart_Element, Player_Ids.length * 36 + 70 );

    new Chart( Chart_Element.querySelector( "canvas" ), {
        type: "bar",
        data: {
            labels: Player_Ids.map( Player_Id => Season.Players[ Player_Id ].Display ),
            datasets: [
                { label: "1st half", data: Player_Ids.map( Player_Id => Halves[ Player_Id ][ 0 ] ), backgroundColor: Colors[ 1 ] || "#A8996B" },
                { label: "2nd half", data: Player_Ids.map( Player_Id => Halves[ Player_Id ][ 1 ] ), backgroundColor: Colors[ 0 ] }
            ]
        },
        options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            scales: { x: { beginAtZero: true, title: { display: true, text: Count_Label( Season ) } } },
            plugins: {
                legend: { position: "top" },
                tooltip: {
                    callbacks: {
                        afterBody: Items => {
                            const [ First, Second ] = Halves[ Player_Ids[ Items[ 0 ].dataIndex ] ];
                            const Change = Second - First;
                            return `Change: ${Change > 0 ? "+" : ""}${Change}`;
                        }
                    }
                }
            }
        }
    } );
}
