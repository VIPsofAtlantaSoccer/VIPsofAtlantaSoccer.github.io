//---------------------------------------------------------------------------------------------------------------//
// Render GameDay lineup JSON into the GameDay_Lineup include
//---------------------------------------------------------------------------------------------------------------//


//---------------------------------------------------------------------------------------------------------------//
// Icon_Library keys used for displayed player events
//---------------------------------------------------------------------------------------------------------------//
const Event_Icon_Names = {
    goal: "Goal",
    penalty_goal: "Penalty",
    penalty_miss: "Missed_Penalty",
    assist: "Assist",
    second_assist: "Second_Assist",
    yellow: "Yellow_Card",
    yellowred: "Second_Yellow_Card",
    red: "Red_Card",
    own_goal: "Own_Goal",
};

const Event_Labels = {
    goal: "Goal",
    penalty_goal: "Penalty",
    penalty_miss: "Missed Penalty",
    assist: "Assist",
    second_assist: "Second Assist",
    yellow: "Yellow Card",
    yellowred: "Second Yellow / Red",
    red: "Red Card",
    own_goal: "Own Goal",
};


//---------------------------------------------------------------------------------------------------------------//
// Escape HTML to prevent injected markup from JSON values
// Returns a safe string
//---------------------------------------------------------------------------------------------------------------//
function Escape_HTML( Value ) {

    if ( Value === null || Value === undefined ) {
        return "";
    }

    return String( Value )
        .replace( /&/g, "&amp;" )
        .replace( /</g, "&lt;" )
        .replace( />/g, "&gt;" )
        .replace( /"/g, "&quot;" )
        .replace( /'/g, "&#039;" );
}

//---------------------------------------------------------------------------------------------------------------//
// Build icon HTML from the Icon_Library data exposed by Jekyll
// Returns HTML string
//---------------------------------------------------------------------------------------------------------------//
function Build_Icon_Library_HTML( Icon_Name, Icon_Size ) {

    let Icon_Library = window.Icon_Library || {};
    let Icon = Icon_Library[Icon_Name];

    if ( !Icon ) {
        return "";
    }

    if ( Icon.File ) {

        let Width = "80";

        if ( Icon_Size === "Small" ) {
            Width = "20";
        } else if ( Icon_Size === "Large" ) {
            Width = "150";
        }

        return `<img class="icon-library-image" src="${Escape_HTML( Icon.File )}" width="${Escape_HTML( Width )}" alt="" aria-hidden="true">`;
    }

    if ( Icon.Value ) {
        return `<span class="icon-library-text" aria-hidden="true">${Escape_HTML( Icon.Value )}</span>`;
    }

    return "";
}

//---------------------------------------------------------------------------------------------------------------//
// Normalize the GameDay directory path so it always ends with a slash
// Returns normalized directory path
//---------------------------------------------------------------------------------------------------------------//
function Normalize_GameDay_Directory( GameDay_Directory ) {

    if ( !GameDay_Directory ) {
        return "";
    }

    if ( GameDay_Directory.endsWith( "/" ) ) {
        return GameDay_Directory;
    }

    return `${GameDay_Directory}/`;
}


//---------------------------------------------------------------------------------------------------------------//
// Load an optional JSON file
// Returns null when the file does not exist or cannot be read
//---------------------------------------------------------------------------------------------------------------//
function Fetch_Optional_JSON( File_Path ) {

    return fetch( File_Path )
        .then( function( Response ) {

            if ( !Response.ok ) {
                return null;
            }

            return Response.json();
        } )
        .catch( function() {
            return null;
        } );
}

//---------------------------------------------------------------------------------------------------------------//
// Add player event types into a set
//---------------------------------------------------------------------------------------------------------------//
function Add_Event_Types_From_Events( Used_Event_Types, Events ) {

    if ( !Events || Events.length === 0 ) {
        return;
    }

    Events.forEach( function( Event ) {

        let Event_Type = Event.type || "";

        if ( Event_Icon_Names[Event_Type] ) {
            Used_Event_Types.add( Event_Type );
        }

    } );
}


//---------------------------------------------------------------------------------------------------------------//
// Collect event types actually used in the displayed lineup
//---------------------------------------------------------------------------------------------------------------//
function Collect_Used_Event_Types( Lineup_Data ) {

    let Used_Event_Types = new Set();

    [ "home", "away" ].forEach( function( Team_Key ) {

        let Team = Lineup_Data.teams[Team_Key];

        if ( !Team ) {
            return;
        }

        ( Team.starters || [] ).forEach( function( Player ) {
            Add_Event_Types_From_Events( Used_Event_Types, Player.events || [] );
        } );

        ( Team.subs || [] ).forEach( function( Substitution ) {
            Add_Event_Types_From_Events( Used_Event_Types, Substitution.events || [] );
        } );

        ( Team.unused || [] ).forEach( function( Player ) {
            Add_Event_Types_From_Events( Used_Event_Types, Player.events || [] );
        } );

    } );

    return Array.from( Used_Event_Types );
}


//---------------------------------------------------------------------------------------------------------------//
// Build legend HTML for used event icons
//---------------------------------------------------------------------------------------------------------------//
function Build_Legend_HTML( Lineup_Data ) {

    let Used_Event_Types = Collect_Used_Event_Types( Lineup_Data );

    if ( Used_Event_Types.length === 0 ) {
        return "";
    }

    let Legend_Order = [
        "goal",
        "penalty_goal",
        "assist",
        "second_assist",
        "yellow",
        "yellowred",
        "red",
        "own_goal",
        "penalty_miss",
    ];

    let Items_HTML = Legend_Order
        .filter( function( Event_Type ) {
            return Used_Event_Types.includes( Event_Type );
        } )
        .map( function( Event_Type ) {
            return `
                <span class="MatchLineup-Legend_Item">
                    <span class="MatchLineup-Legend_Icon">${Build_Icon_Library_HTML( Event_Icon_Names[Event_Type], "Small" )}</span>
                    <span class="MatchLineup-Legend_Label">${Escape_HTML( Event_Labels[Event_Type] )}</span>
                </span>
            `;
        } )
        .join( "" );

    return `
        <div class="MatchLineup-Legend">
            <span class="MatchLineup-Legend_Title">Legend:</span>
            <div class="MatchLineup-Legend_Items">
                ${Items_HTML}
            </div>
        </div>
    `;
}

//---------------------------------------------------------------------------------------------------------------//
// Merge availability report data into lineup data
// Returns updated lineup data
//---------------------------------------------------------------------------------------------------------------//
function Apply_Availability_Report( Lineup_Data, Availability_Data ) {

    if ( !Availability_Data || !Availability_Data.teams || !Lineup_Data.teams ) {
        return Lineup_Data;
    }

    [ "home", "away" ].forEach( function( Team_Key ) {

        if ( !Lineup_Data.teams[Team_Key] || !Availability_Data.teams[Team_Key] ) {
            return;
        }

        Lineup_Data.teams[Team_Key].unavailable = Availability_Data.teams[Team_Key].unavailable || [];
        Lineup_Data.teams[Team_Key].questionable = Availability_Data.teams[Team_Key].questionable || [];

    } );

    return Lineup_Data;
}


//---------------------------------------------------------------------------------------------------------------//
// Return a player's display label with shirt number, name, captain, events, and came-off indicator
// Returns HTML string
//---------------------------------------------------------------------------------------------------------------//
function Build_Player_HTML( Player ) {

    let Number_HTML = "";

    if ( Player.number !== "" && Player.number !== null && Player.number !== undefined ) {
        Number_HTML = `<span class="MatchLineup-Player_Number">${Escape_HTML( Player.number )}</span>`;
    }

    let Captain_HTML = "";

    if ( Player.captain === true ) {
        Captain_HTML = `<span class="MatchLineup-Captain">(c)</span>`;
    }

    let Events_HTML = Build_Player_Events_HTML( Player.events || [] );

    let Came_Off_HTML = "";

    if ( Player.came_off ) {
        Came_Off_HTML = `
            <span class="MatchLineup-Came_Off">
                off ${Escape_HTML( Player.came_off.minute )}' for ${Escape_HTML( Player.came_off.for )}
            </span>
        `;
    }

    return `
        <div class="MatchLineup-Player">
            ${Number_HTML}
            <span class="MatchLineup-Player_Name">${Escape_HTML( Player.name )}</span>
            ${Captain_HTML}
            ${Events_HTML}
            ${Came_Off_HTML}
        </div>
    `;
}


//---------------------------------------------------------------------------------------------------------------//
// Group starters by role group
// Returns object keyed by role group
//---------------------------------------------------------------------------------------------------------------//
function Group_Starters_By_Role( Starters ) {

    let Grouped_Starters = {
        GK: [],
        DEF: [],
        MID: [],
        FWD: [],
        OTHER: [],
    };

    Starters.forEach( function( Player ) {

        let Role_Group = Player.role_group || "OTHER";

        if ( !Grouped_Starters[Role_Group] ) {
            Role_Group = "OTHER";
        }

        Grouped_Starters[Role_Group].push( Player );

    } );

    return Grouped_Starters;
}


//---------------------------------------------------------------------------------------------------------------//
// Build starter rows for one team
// Returns HTML string
//---------------------------------------------------------------------------------------------------------------//
function Build_Starters_HTML( Starters ) {

    let Grouped_Starters = Group_Starters_By_Role( Starters );

    let Role_Order = [
        "GK",
        "DEF",
        "MID",
        "FWD",
        "OTHER",
    ];

    let HTML = "";

    Role_Order.forEach( function( Role_Group ) {

        let Players = Grouped_Starters[Role_Group];

        if ( Players.length === 0 ) {
            return;
        }

        let Label = Role_Group;

        if ( Role_Group === "OTHER" ) {
            Label = "Field";
        }

        let Players_HTML = Players.map( Build_Player_HTML ).join( "" );

        HTML += `
            <div class="MatchLineup-Row">
                <div class="MatchLineup-Label">${Escape_HTML( Label )}</div>
                <div class="MatchLineup-Players">
                    ${Players_HTML}
                </div>
            </div>
        `;

    } );

    return HTML;
}


//---------------------------------------------------------------------------------------------------------------//
// Build used substitutions section for one team
// Returns HTML string
//---------------------------------------------------------------------------------------------------------------//
function Build_Subs_HTML( Subs ) {

    if ( !Subs || Subs.length === 0 ) {
        return "";
    }

    let Items_HTML = Subs.map( function( Substitution ) {

        let Events_HTML = Build_Player_Events_HTML( Substitution.events || [] );

        let Minute_HTML = "";

        if ( Substitution.minute ) {
            Minute_HTML = `<span class="MatchLineup-Sub_Minute">(${Escape_HTML( Substitution.minute )}')</span>`;
        }

        return `
            <div class="MatchLineup-Sub">
                <span class="MatchLineup-Sub_On">${Escape_HTML( Substitution.player_on )}</span>
                ${Events_HTML}
                ${Minute_HTML}
                <span class="MatchLineup-Sub_For">for</span>
                <span class="MatchLineup-Sub_Off">${Escape_HTML( Substitution.player_off )}</span>
            </div>
        `;

    } ).join( "" );

    return `
        <div class="MatchLineup-Extra_Block">
            <div class="MatchLineup-Extra_Label">Subs</div>
            <div class="MatchLineup-Extra_Value">
                ${Items_HTML}
            </div>
        </div>
    `;
}


//---------------------------------------------------------------------------------------------------------------//
// Build unused substitutes section for one team
// Returns HTML string
//---------------------------------------------------------------------------------------------------------------//
function Build_Unused_HTML( Unused ) {

    if ( !Unused || Unused.length === 0 ) {
        return "";
    }

    let Names = Unused.map( function( Player ) {
        return Escape_HTML( Player.name );
    } );

    return `
        <div class="MatchLineup-Extra_Block">
            <div class="MatchLineup-Extra_Label">Unused</div>
            <div class="MatchLineup-Extra_Value">${Names.join( ", " )}</div>
        </div>
    `;
}


//---------------------------------------------------------------------------------------------------------------//
// Build player availability list
// Returns HTML string
//---------------------------------------------------------------------------------------------------------------//
function Build_Availability_HTML( Label, Players ) {

    if ( !Players || Players.length === 0 ) {
        return "";
    }

    let Player_Text = Players.map( function( Player ) {

        if ( Player.reason ) {
            return `${Escape_HTML( Player.name )} (${Escape_HTML( Player.reason )})`;
        }

        return Escape_HTML( Player.name );

    } ).join( ", " );

    return `
        <div class="MatchLineup-Extra_Block">
            <div class="MatchLineup-Extra_Label">${Escape_HTML( Label )}</div>
            <div class="MatchLineup-Extra_Value">${Player_Text}</div>
        </div>
    `;
}


//---------------------------------------------------------------------------------------------------------------//
// Build one team lineup card
// Returns HTML string
//---------------------------------------------------------------------------------------------------------------//
function Build_Team_HTML( Team_Key, Team ) {

    let Starters_HTML = Build_Starters_HTML( Team.starters || [] );
    let Subs_HTML = Build_Subs_HTML( Team.subs || [] );
    let Unused_HTML = Build_Unused_HTML( Team.unused || [] );
    let Unavailable_HTML = Build_Availability_HTML( "Unavailable", Team.unavailable || [] );
    let Questionable_HTML = Build_Availability_HTML( "Questionable", Team.questionable || [] );

    let Formation_HTML = "";

    if ( Team.formation ) {
        Formation_HTML = `
            <span class="MatchLineup-Team_Formation">
                (${Escape_HTML( Team.formation )})
            </span>
        `;
    }

    return `
        <div class="MatchLineup-Team MatchLineup-Team_${Escape_HTML( Team_Key )}">
            <div class="MatchLineup-Team_Header">
                <h3 class="MatchLineup-Team_Title">
                    ${Escape_HTML( Team.label )}
                    ${Formation_HTML}
                </h3>
            </div>

            <div class="MatchLineup-Starters">
                ${Starters_HTML}
            </div>

            <div class="MatchLineup-Extras">
                ${Subs_HTML}
                ${Unused_HTML}
                ${Unavailable_HTML}
                ${Questionable_HTML}
            </div>
        </div>
    `;
}


//---------------------------------------------------------------------------------------------------------------//
// Build the full lineup component
// Returns HTML string
//---------------------------------------------------------------------------------------------------------------//
function Build_Lineup_HTML( Lineup_Data, Key_Events_Data ) {

    let Home_Team = Lineup_Data.teams.home;
    let Away_Team = Lineup_Data.teams.away;
    let Legend_HTML = Build_Legend_HTML( Lineup_Data );

    return `
        <div class="MatchLineup-Inner">
            <div class="MatchLineup-Teams">
                ${Build_Team_HTML( "home", Home_Team )}
                ${Build_Team_HTML( "away", Away_Team )}
            </div>
            ${Legend_HTML}
        </div>
    `;
}


//---------------------------------------------------------------------------------------------------------------//
// Build player event icons
// Returns HTML string
//---------------------------------------------------------------------------------------------------------------//
function Build_Player_Events_HTML( Events ) {

    if ( !Events || Events.length === 0 ) {
        return "";
    }

    Events = Events.slice().sort( function( A, B ) {

        let Minute_A = parseInt( A.minute, 10 ) || 0;
        let Minute_B = parseInt( B.minute, 10 ) || 0;

        return Minute_A - Minute_B;

    } );

    let Events_HTML = Events.map( function( Event ) {

        let Event_Type = Event.type || "";
        let Icon_Name = Event_Icon_Names[Event_Type] || "";
        let Icon_HTML = Build_Icon_Library_HTML( Icon_Name, "Small" );

        if ( Icon_HTML === "" ) {
            return "";
        }

        return `
            <span class="MatchLineup-Player_Event MatchLineup-Player_Event_${Escape_HTML( Event_Type )}">
                ${Icon_HTML}
            </span>
        `;

    } ).join( "" );

    return `
        <span class="MatchLineup-Player_Events">
            ${Events_HTML}
        </span>
    `;
}


//---------------------------------------------------------------------------------------------------------------//
// Load and render one GameDay lineup block
//---------------------------------------------------------------------------------------------------------------//
function Load_GameDay_Lineup( MatchLineup_Element ) {

    let GameDay_Directory = Normalize_GameDay_Directory(
        MatchLineup_Element.getAttribute( "content_assets_dir" )
    );

    if ( !GameDay_Directory ) {
        MatchLineup_Element.innerHTML = `<div class="MatchLineup-Error">No GameDay directory specified.</div>`;
        return;
    }

    // The 3 json files
    let Lineup_File       = `${GameDay_Directory}GameDay_Lineup.json`;
    let Key_Events_File   = `${GameDay_Directory}GameDay_Key_Events.json`;
    let Availability_File = `${GameDay_Directory}GameDay_Availability_Report.json`;

    fetch( Lineup_File )
        .then( function( Response ) {

            if ( !Response.ok ) {
                throw new Error( `Unable to load lineup file: ${Lineup_File}` );
            }

            return Response.json();
        } )
        .then( function( Lineup_Data ) {

            return Promise.all( [
                Promise.resolve( Lineup_Data ),
                Fetch_Optional_JSON( Key_Events_File ),
                Fetch_Optional_JSON( Availability_File ),
            ] );

        } )
        .then( function( Results ) {

            let Lineup_Data = Results[0];
            let Key_Events_Data = Results[1];
            let Availability_Data = Results[2];

            Lineup_Data = Apply_Availability_Report(
                Lineup_Data,
                Availability_Data
            );

            MatchLineup_Element.innerHTML = Build_Lineup_HTML(
                Lineup_Data,
                Key_Events_Data
            );

        } )
        .catch( function( Error ) {
            console.error( Error );
            MatchLineup_Element.innerHTML = `<div class="MatchLineup-Error">Unable to load lineup.</div>`;
        } );
}


//---------------------------------------------------------------------------------------------------------------//
// Initialize all GameDay lineup blocks on the page
//---------------------------------------------------------------------------------------------------------------//
function Initialize_GameDay_Lineups() {

    let MatchLineup_Elements = document.querySelectorAll( ".MatchLineup[content_assets_dir]" );

    MatchLineup_Elements.forEach( function( MatchLineup_Element ) {
        Load_GameDay_Lineup( MatchLineup_Element );
    } );
}


if ( document.readyState === "loading" ) {
    document.addEventListener( "DOMContentLoaded", Initialize_GameDay_Lineups );
} else {
    Initialize_GameDay_Lineups();
}