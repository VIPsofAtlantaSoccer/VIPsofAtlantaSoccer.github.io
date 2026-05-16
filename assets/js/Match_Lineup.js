//---------------------------------------------------------------------------------------------------------------//
// Render Match Lineup JSON into the MatchLineup include
//---------------------------------------------------------------------------------------------------------------//

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
// Return a player's display label with shirt number, name, captain, and came-off indicator
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

    let Came_Off_HTML = "";

    if ( Player.came_off ) {
        Came_Off_HTML = `
            <span class="MatchLineup-Came_Off">
                off ${Escape_HTML( Player.came_off.minute )}' for ${Escape_HTML( Player.came_off.for )}
            </span>
        `;
    }

    let Events_HTML = Build_Player_Events_HTML( Player.events || [] );

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
            Label = "Other";
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

        return `
            <div class="MatchLineup-Sub">
                <span class="MatchLineup-Sub_On">${Escape_HTML( Substitution.player_on )}</span>
                <span class="MatchLineup-Sub_Minute"> (${Escape_HTML( Substitution.minute )}') </span>
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
function Build_Lineup_HTML( Lineup_Data ) {

    let Home_Team = Lineup_Data.teams.home;
    let Away_Team = Lineup_Data.teams.away;

    return `
        <div class="MatchLineup-Inner">

            <div class="MatchLineup-Teams">
                ${Build_Team_HTML( "home", Home_Team )}
                ${Build_Team_HTML( "away", Away_Team )}
            </div>
        </div>
    `;
}


//---------------------------------------------------------------------------------------------------------------//
// Load and render one lineup block
//---------------------------------------------------------------------------------------------------------------//
function Load_Match_Lineup( MatchLineup_Element ) {

    let Lineup_File = MatchLineup_Element.getAttribute( "data-lineup-file" );

    if ( !Lineup_File ) {
        MatchLineup_Element.innerHTML = `<div class="MatchLineup-Error">No lineup file specified.</div>`;
        return;
    }

    fetch( Lineup_File )
        .then( function( Response ) {

            if ( !Response.ok ) {
                throw new Error( `Unable to load lineup file: ${Lineup_File}` );
            }

            return Response.json();
        } )
        .then( function( Lineup_Data ) {
            MatchLineup_Element.innerHTML = Build_Lineup_HTML( Lineup_Data );
        } )
        .catch( function( Error ) {
            console.error( Error );
            MatchLineup_Element.innerHTML = `<div class="MatchLineup-Error">Unable to load lineup.</div>`;
        } );
}


//---------------------------------------------------------------------------------------------------------------//
// Initialize all lineup blocks on the page
//---------------------------------------------------------------------------------------------------------------//
function Initialize_Match_Lineups() {

    let MatchLineup_Elements = document.querySelectorAll( ".MatchLineup[data-lineup-file]" );

    MatchLineup_Elements.forEach( function( MatchLineup_Element ) {
        Load_Match_Lineup( MatchLineup_Element );
    } );
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
// Build player event icons
// Returns HTML string
//---------------------------------------------------------------------------------------------------------------//
function Build_Player_Events_HTML( Events ) {

    if ( !Events || Events.length === 0 ) {
        return "";
    }

    //-----------------------------------------------------------------------------------------------------------//
    // Sort events by minute (numeric)
    //-----------------------------------------------------------------------------------------------------------//
    Events = Events.slice().sort( function( A, B ) {

        let Minute_A = parseInt( A.minute, 10 ) || 0;
        let Minute_B = parseInt( B.minute, 10 ) || 0;

        return Minute_A - Minute_B;

    } );

    let Event_Icons = {
        goal: "⚽",
        assist: "🅰",
        second_assist: "🅰",
        yellow: "🟨",
        yellowred: "🟨🟥",
        red: "🟥",
    };

    let Events_HTML = Events.map( function( Event ) {

        let Event_Type = Event.type || "";
        let Icon = Event_Icons[Event_Type] || "";

        if ( Icon === "" ) {
            return "";
        }

        return `
            <span class="MatchLineup-Player_Event MatchLineup-Player_Event_${Escape_HTML( Event_Type )}">
                ${Icon}
            </span>
        `;
                //${Icon}${Escape_HTML( Event.minute )}

    } ).join( "" );

    return `
        <span class="MatchLineup-Player_Events">
            ${Events_HTML}
        </span>
    `;
}


document.addEventListener( "DOMContentLoaded", Initialize_Match_Lineups );