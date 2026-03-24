//---------------------------------------------------------------------------------------------------------------#
// Game Notes charts + filtering
// - Reads Game_Notes.csv from the same page directory
// - Uses window.Game_Notes_Players from Jekyll _data/Game_Notes_Players.json
// - Builds 1st Half and 2nd Half player involvement charts
// - Player list buttons filter the notes table
//---------------------------------------------------------------------------------------------------------------#

document.addEventListener( "DOMContentLoaded", function ( ) {
    Initialize_Game_Notes( );
} );


//---------------------------------------------------------------------------------------------------------------#
// Initialize the Game Notes charts and table
// Returns nothing
//---------------------------------------------------------------------------------------------------------------#
async function Initialize_Game_Notes( ) {
    const Game_Notes_Element = document.getElementById( "GameNotes" );

    if ( !Game_Notes_Element ) {
        return;
    }

    const Csv_Path = Game_Notes_Element.dataset.csv;
    const Players_Data = window.Game_Notes_Players || [];

    if ( !Csv_Path ) {
        console.error( "Game_Notes.csv path was not found." );
        return;
    }

    try {
        const Csv_Text = await Fetch_Text( Csv_Path );
        const Notes_Rows = Parse_Game_Notes_Csv( Csv_Text );
        const Players = Prepare_Player_Lookups( Players_Data );
        const Game_Data = Build_Game_Notes_Data( Notes_Rows, Players );

        Render_Game_Notes_Charts( Game_Data );

        Bind_Clear_Filter_Button( Notes_Rows );
        Bind_Show_All_Button( Notes_Rows );

        const Url_Params = new URLSearchParams( window.location.search );
        const Selected_Player = Url_Params.get( "player" );

        if ( Selected_Player ) {
            Apply_Player_Filter( Selected_Player, Notes_Rows );
        }
    }
    catch ( Error_Object ) {
        console.error( "Failed to initialize game notes:", Error_Object );
    }
}


//---------------------------------------------------------------------------------------------------------------#
// Fetch a text file
// Returns the file contents as text
//---------------------------------------------------------------------------------------------------------------#
async function Fetch_Text ( File_Path ) {
    const Response = await fetch( File_Path );

    if ( !Response.ok ) {
        throw new Error( `Failed to fetch file: ${File_Path}` );
    }

    return await Response.text( );
}


//---------------------------------------------------------------------------------------------------------------#
// Parse the CSV text into note rows
// Returns an array of row objects
//---------------------------------------------------------------------------------------------------------------#
function Parse_Game_Notes_Csv ( Csv_Text ) {
    const Parsed_Result = Papa.parse(
        Csv_Text,
        {
            header: true,
            skipEmptyLines: true
        }
    );

    const Notes_Rows = [];

    for ( let Row_Index = 0; Row_Index < Parsed_Result.data.length; Row_Index++ ) {
        const Row = Parsed_Result.data[ Row_Index ];

        const Game_Phase_Value = Get_Row_Value( Row, "Game Phase" );

        if ( !Is_Valid_Game_Phase( Game_Phase_Value ) ) {
            continue;
        }

        const Note_Row = {
            Row_Id: `Row_${Row_Index}`,
            Game_Phase: Game_Phase_Value,
            Minute: Get_Row_Value( Row, "Minute" ),
            Post: Get_Row_Value( Row, "Post" ),
            Post_Normalized: Normalize_Text( Get_Row_Value( Row, "Post" ) )
        };

        Notes_Rows.push( Note_Row );
    }

    return Notes_Rows;
}


//---------------------------------------------------------------------------------------------------------------#
// Safely get a row value by column name
// Returns a trimmed string
//---------------------------------------------------------------------------------------------------------------#
function Get_Row_Value ( Row, Column_Name ) {
    if ( !( Column_Name in Row ) ) {
        return "";
    }

    if ( Row[ Column_Name ] == null ) {
        return "";
    }

    return String( Row[ Column_Name ] ).trim( );
}


//---------------------------------------------------------------------------------------------------------------#
// Prepare player lookups from the JSON file
// Returns an array of player objects with split lookups
//---------------------------------------------------------------------------------------------------------------#
function Prepare_Player_Lookups ( Players_Data ) {
    const Players = [];

    for ( let Player_Index = 0; Player_Index < Players_Data.length; Player_Index++ ) {
        const Player_Row = Players_Data[ Player_Index ];

        const Lookup_List = String( Player_Row.Lookups || "" )
            .split( "|" )
            .map(
                function ( Lookup_Value ) {
                    return Normalize_Text( Lookup_Value );
                }
            )
            .filter(
                function ( Lookup_Value ) {
                    return Lookup_Value !== "";
                }
            );

        Players.push(
            {
                Name: String( Player_Row.Name || "" ).trim( ),
                Lookups: Lookup_List
            }
        );
    }

    return Players;
}


//---------------------------------------------------------------------------------------------------------------#
// Build all derived data for charts and filtering
// Returns an object with players, notes, counts, and player matches
//---------------------------------------------------------------------------------------------------------------#
function Build_Game_Notes_Data ( Notes_Rows, Players ) {
    const Counts_1st_Half = {};
    const Counts_2nd_Half = {};
    const Player_Matches = {};

    for ( let Player_Index = 0; Player_Index < Players.length; Player_Index++ ) {
        const Player = Players[ Player_Index ];

        Counts_1st_Half[ Player.Name ] = 0;
        Counts_2nd_Half[ Player.Name ] = 0;
        Player_Matches[ Player.Name ] = [];
    }

    for ( let Row_Index = 0; Row_Index < Notes_Rows.length; Row_Index++ ) {
        const Note_Row = Notes_Rows[ Row_Index ];

        for ( let Player_Index = 0; Player_Index < Players.length; Player_Index++ ) {
            const Player = Players[ Player_Index ];

            if ( Note_Row_Matches_Player( Note_Row, Player ) ) {
                Player_Matches[ Player.Name ].push( Note_Row.Row_Id );

                if ( Note_Row.Game_Phase === "1st Half" ) {
                    Counts_1st_Half[ Player.Name ] += 1;
                }
                else if ( Note_Row.Game_Phase === "2nd Half" ) {
                    Counts_2nd_Half[ Player.Name ] += 1;
                }
            }
        }
    }

    return {
        Players: Players,
        Notes_Rows: Notes_Rows,
        Counts_1st_Half: Counts_1st_Half,
        Counts_2nd_Half: Counts_2nd_Half,
        Player_Matches: Player_Matches
    };
}


//---------------------------------------------------------------------------------------------------------------#
// Check whether a note row matches a player lookup
// Returns true or false
//---------------------------------------------------------------------------------------------------------------#
function Note_Row_Matches_Player ( Note_Row, Player ) {
    const Note_Text = Note_Row.Post_Normalized;

    for ( let Lookup_Index = 0; Lookup_Index < Player.Lookups.length; Lookup_Index++ ) {
        const Lookup_Value = Player.Lookups[ Lookup_Index ];

        if ( Lookup_Value === "" ) {
            continue;
        }

        if ( Lookup_Value.indexOf( " " ) >= 0 ) {
            if ( Note_Text.indexOf( Lookup_Value ) >= 0 ) {
                return true;
            }
        }
        else {
            const Lookup_Pattern = new RegExp( `\\b${Escape_Regex( Lookup_Value )}\\b`, "i" );

            if ( Lookup_Pattern.test( Note_Text ) ) {
                return true;
            }
        }
    }

    return false;
}


//---------------------------------------------------------------------------------------------------------------#
// Normalize text for matching
// Returns normalized text
//---------------------------------------------------------------------------------------------------------------#
function Normalize_Text ( Text_Value ) {
    if ( Text_Value == null ) {
        return "";
    }

    return String( Text_Value )
        .normalize( "NFD" )
        .replace( /[\u0300-\u036f]/g, "" )
        .toLowerCase( )
        .replace( /\s+/g, " " )
        .trim( );
}


//---------------------------------------------------------------------------------------------------------------#
// Escape regex characters
// Returns escaped text
//---------------------------------------------------------------------------------------------------------------#
function Escape_Regex ( Text_Value ) {
    return Text_Value.replace( /[.*+?^${}()|[\]\\]/g, "\\$&" );
}


//---------------------------------------------------------------------------------------------------------------#
// Render both game notes charts
// Returns nothing
//---------------------------------------------------------------------------------------------------------------#
function Render_Game_Notes_Charts ( Game_Data ) {
    const First_Half_Chart_Data = Build_Chart_Data( Game_Data.Counts_1st_Half );
    const Second_Half_Chart_Data = Build_Chart_Data( Game_Data.Counts_2nd_Half );

    Create_Game_Notes_Chart(
        "Game_Notes_Chart_1st_Half",
        First_Half_Chart_Data
    );

    Create_Game_Notes_Chart(
        "Game_Notes_Chart_2nd_Half",
        Second_Half_Chart_Data
    );

    Render_Combined_Game_Notes_Player_List(
        "Game_Notes_Player_List",
        Game_Data,
        Game_Data.Notes_Rows
    );
}


//---------------------------------------------------------------------------------------------------------------#
// Build sorted chart data from a count object
// Returns labels and values
//---------------------------------------------------------------------------------------------------------------#
function Build_Chart_Data ( Counts_Object ) {
    const Data_Rows = [];

    for ( const Player_Name in Counts_Object ) {
        if ( Counts_Object[ Player_Name ] > 0 ) {
            Data_Rows.push(
                {
                    Name: Player_Name,
                    Count: Counts_Object[ Player_Name ]
                }
            );
        }
    }

    Data_Rows.sort(
        function ( Left_Row, Right_Row ) {
            return Right_Row.Count - Left_Row.Count;
        }
    );

    return {
        Labels: Data_Rows.map(
            function ( Data_Row ) {
                return Data_Row.Name;
            }
        ),
        Values: Data_Rows.map(
            function ( Data_Row ) {
                return Data_Row.Count;
            }
        )
    };
}


//---------------------------------------------------------------------------------------------------------------#
// Create a single game notes chart
// Returns nothing
//---------------------------------------------------------------------------------------------------------------#
function Create_Game_Notes_Chart ( Canvas_Id, Chart_Data ) {
    const Canvas_Element = document.getElementById( Canvas_Id );

    if ( !Canvas_Element ) {
        return;
    }

    const Minimum_Chart_Height = 260;
    const Pixels_Per_Player = 24;
    const Chart_Height = Math.max( Minimum_Chart_Height, Chart_Data.Labels.length * Pixels_Per_Player );

    Canvas_Element.style.height = `${Chart_Height}px`;

    new Chart(
        Canvas_Element,
        {
            type: "bar",
            data: {
                labels: Chart_Data.Labels,
                datasets: [
                    {
                        data: Chart_Data.Values
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                indexAxis: "y",
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    },
                    y: {
                        ticks: {
                            autoSkip: false
                        }
                    }
                }
            }
        }
    );
}


//---------------------------------------------------------------------------------------------------------------#
// Render the full notes table
// Returns nothing
//---------------------------------------------------------------------------------------------------------------#
function Render_Game_Notes_Table ( Notes_Rows ) {
    const Table_Body = document.getElementById( "Game_Notes_Table_Body" );

    if ( !Table_Body ) {
        return;
    }

    Table_Body.innerHTML = "";

    for ( let Row_Index = 0; Row_Index < Notes_Rows.length; Row_Index++ ) {
        const Note_Row = Notes_Rows[ Row_Index ];
        Table_Body.appendChild( Build_Game_Notes_Table_Row( Note_Row ) );
    }
}


//---------------------------------------------------------------------------------------------------------------#
// Build a single table row
// Returns a TR element
//---------------------------------------------------------------------------------------------------------------#
function Build_Game_Notes_Table_Row ( Note_Row ) {
    const Table_Row = document.createElement( "tr" );
    Table_Row.dataset.rowId = Note_Row.Row_Id;

    const Phase_Cell = document.createElement( "td" );
    Phase_Cell.textContent = Note_Row.Game_Phase;

    const Minute_Cell = document.createElement( "td" );
    Minute_Cell.textContent = Note_Row.Minute;

    const Post_Cell = document.createElement( "td" );
    Post_Cell.textContent = Note_Row.Post;

    Table_Row.appendChild( Phase_Cell );
    Table_Row.appendChild( Minute_Cell );
    Table_Row.appendChild( Post_Cell );

    return Table_Row;
}


//---------------------------------------------------------------------------------------------------------------#
// Apply a player filter to the notes table
// Returns nothing
//---------------------------------------------------------------------------------------------------------------#
function Apply_Player_Filter ( Player_Name, Notes_Rows ) {
    const Table_Body = document.getElementById( "Game_Notes_Table_Body" );
    const Table_Wrap = document.getElementById( "Game_Notes_Table_Wrap" );

    if ( !Table_Body ) {
        return;
    }

    const Player_Definition = Find_Player_Definition( Player_Name );

    if ( !Player_Definition ) {
        return;
    }

    const Matching_Rows = [];

    for ( let Row_Index = 0; Row_Index < Notes_Rows.length; Row_Index++ ) {
        const Note_Row = Notes_Rows[ Row_Index ];

        if ( Note_Row_Matches_Player( Note_Row, Player_Definition ) ) {
            Matching_Rows.push( Note_Row );
        }
    }

    Table_Body.innerHTML = "";

    for ( let Row_Index = 0; Row_Index < Matching_Rows.length; Row_Index++ ) {
        Table_Body.appendChild( Build_Game_Notes_Table_Row( Matching_Rows[ Row_Index ] ) );
    }

    if ( Table_Wrap ) {
        Table_Wrap.hidden = false;
    }

    Set_Selected_Player_Button( Player_Name );

    const Current_Url = new URL( window.location.href );
    Current_Url.searchParams.set( "player", Player_Name );
    window.history.replaceState( {}, "", Current_Url );
}


//---------------------------------------------------------------------------------------------------------------#
// Find a player definition by name
// Returns the player object or null
//---------------------------------------------------------------------------------------------------------------#
function Find_Player_Definition ( Player_Name ) {
    const Players_Data = window.Game_Notes_Players || [];
    const Players = Prepare_Player_Lookups( Players_Data );

    for ( let Player_Index = 0; Player_Index < Players.length; Player_Index++ ) {
        if ( Players[ Player_Index ].Name === Player_Name ) {
            return Players[ Player_Index ];
        }
    }

    return null;
}


//---------------------------------------------------------------------------------------------------------------#
// Bind the clear filter button
// Returns nothing
//---------------------------------------------------------------------------------------------------------------#
function Bind_Clear_Filter_Button ( Notes_Rows ) {
    const Clear_Button = document.getElementById( "Game_Notes_Clear_Filter" );
    const Table_Body = document.getElementById( "Game_Notes_Table_Body" );
    const Table_Wrap = document.getElementById( "Game_Notes_Table_Wrap" );

    if ( !Clear_Button ) {
        return;
    }

    Clear_Button.addEventListener(
        "click",
        function ( ) {
            if ( Table_Body ) {
                Table_Body.innerHTML = "";
            }

            if ( Table_Wrap ) {
                Table_Wrap.hidden = true;
            }

            Set_Selected_Player_Button( "" );

            const Current_Url = new URL( window.location.href );
            Current_Url.searchParams.delete( "player" );
            window.history.replaceState( {}, "", Current_Url );
        }
    );
}


//---------------------------------------------------------------------------------------------------------------#
// Bind the show all game notes button
// Returns nothing
//---------------------------------------------------------------------------------------------------------------#
function Bind_Show_All_Button ( Notes_Rows ) {
    const Show_All_Button = document.getElementById( "Game_Notes_Show_All" );
    const Table_Wrap = document.getElementById( "Game_Notes_Table_Wrap" );

    if ( !Show_All_Button ) {
        return;
    }

    Show_All_Button.addEventListener(
        "click",
        function ( ) {
            Render_Game_Notes_Table( Notes_Rows );

            if ( Table_Wrap ) {
                Table_Wrap.hidden = false;
            }

            Set_Selected_Player_Button( "" );

            const Current_Url = new URL( window.location.href );
            Current_Url.searchParams.delete( "player" );
            window.history.replaceState( {}, "", Current_Url );
        }
    );
}


//---------------------------------------------------------------------------------------------------------------#
// Determine if a row should be included based on Game Phase
// Returns true if the row should be kept
//---------------------------------------------------------------------------------------------------------------#
function Is_Valid_Game_Phase ( Game_Phase_Value ) {
    const Phase = Normalize_Text( Game_Phase_Value );

    if (
        Phase === "1st half" ||
        Phase === "first half"
    ) {
        return true;
    }

    if (
        Phase === "2nd half" ||
        Phase === "second half"
    ) {
        return true;
    }

    return false;
}


//---------------------------------------------------------------------------------------------------------------#
// Render a combined clickable player list
// Returns nothing
//---------------------------------------------------------------------------------------------------------------#
function Render_Combined_Game_Notes_Player_List ( Container_Id, Game_Data, Notes_Rows ) {
    const Container_Element = document.getElementById( Container_Id );

    if ( !Container_Element ) {
        return;
    }

    Container_Element.innerHTML = "";

    const Player_Total_Rows = [];

    for ( let Player_Index = 0; Player_Index < Game_Data.Players.length; Player_Index++ ) {
        const Player_Name = Game_Data.Players[ Player_Index ].Name;
        const First_Half_Count = Game_Data.Counts_1st_Half[ Player_Name ] || 0;
        const Second_Half_Count = Game_Data.Counts_2nd_Half[ Player_Name ] || 0;
        const Total_Count = First_Half_Count + Second_Half_Count;

        if ( Total_Count > 0 ) {
            Player_Total_Rows.push(
                {
                    Name: Player_Name,
                    Total_Count: Total_Count
                }
            );
        }
    }

    Player_Total_Rows.sort(
        function ( Left_Row, Right_Row ) {
            if ( Right_Row.Total_Count !== Left_Row.Total_Count ) {
                return Right_Row.Total_Count - Left_Row.Total_Count;
            }

            return Left_Row.Name.localeCompare( Right_Row.Name );
        }
    );

    for ( let Player_Index = 0; Player_Index < Player_Total_Rows.length; Player_Index++ ) {
        const Player_Row = Player_Total_Rows[ Player_Index ];

        const Player_Button = document.createElement( "button" );
        Player_Button.type = "button";
        Player_Button.className = "GameNotes-Player_List_Button";
        Player_Button.dataset.playerName = Player_Row.Name;
        Player_Button.textContent = `${Player_Row.Name} (${Player_Row.Total_Count})`;

        Player_Button.addEventListener(
            "click",
            function ( ) {
                Apply_Player_Filter( Player_Row.Name, Notes_Rows );
            }
        );

        Container_Element.appendChild( Player_Button );
    }
}

//---------------------------------------------------------------------------------------------------------------#
// Highlight the selected player button
// Returns nothing
//---------------------------------------------------------------------------------------------------------------#
function Set_Selected_Player_Button ( Player_Name ) {
    const Player_Buttons = document.querySelectorAll( ".GameNotes-Player_List_Button" );

    for ( let Button_Index = 0; Button_Index < Player_Buttons.length; Button_Index++ ) {
        const Player_Button = Player_Buttons[ Button_Index ];

        if ( Player_Button.dataset.playerName === Player_Name ) {
            Player_Button.classList.add( "is-selected" );
        }
        else {
            Player_Button.classList.remove( "is-selected" );
        }
    }
}