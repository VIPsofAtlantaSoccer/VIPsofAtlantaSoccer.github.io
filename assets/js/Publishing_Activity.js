(function () {
    "use strict";

    //---------------------------------------------------------------------------------------------------------------#
    // Convert a YYYY-MM-DD value into a local Date object without timezone shifting
    // Returns the parsed Date object
    //---------------------------------------------------------------------------------------------------------------#
    function Parse_Local_Date(Date_Value) {
        var Date_Parts = Date_Value.split("-");

        return new Date(
            parseInt(Date_Parts[0], 10),
            parseInt(Date_Parts[1], 10) - 1,
            parseInt(Date_Parts[2], 10)
        );
    }

    //---------------------------------------------------------------------------------------------------------------#
    // Convert a Date object into a YYYY-MM-DD value
    // Returns the formatted date
    //---------------------------------------------------------------------------------------------------------------#
    function Format_Date_Key(Date_Value) {
        var Year = Date_Value.getFullYear();
        var Month = String(Date_Value.getMonth() + 1).padStart(2, "0");
        var Day = String(Date_Value.getDate()).padStart(2, "0");

        return Year + "-" + Month + "-" + Day;
    }

    //---------------------------------------------------------------------------------------------------------------#
    // Return the first Sunday on or before January 1st for the supplied year
    // Returns the starting date for the calendar grid
    //---------------------------------------------------------------------------------------------------------------#
    function Get_Calendar_Start_Date(Year) {
        var Start_Date = new Date(Year, 0, 1);

        Start_Date.setDate(Start_Date.getDate() - Start_Date.getDay());

        return Start_Date;
    }

    //---------------------------------------------------------------------------------------------------------------#
    // Return the first Saturday on or after December 31st for the supplied year
    // Returns the ending date for the calendar grid
    //---------------------------------------------------------------------------------------------------------------#
    function Get_Calendar_End_Date(Year) {
        var End_Date = new Date(Year, 11, 31);

        End_Date.setDate(End_Date.getDate() + (6 - End_Date.getDay()));

        return End_Date;
    }

    //---------------------------------------------------------------------------------------------------------------#
    // Determine the activity level used to style a calendar day
    // Returns a value from 0 through 4
    //---------------------------------------------------------------------------------------------------------------#
    function Get_Activity_Level(Item_Count) {
        if (Item_Count >= 4) {
            return 4;
        }

        return Item_Count;
    }

    //---------------------------------------------------------------------------------------------------------------#
    // Build a tooltip description for one calendar day
    // Returns the tooltip text
    //---------------------------------------------------------------------------------------------------------------#
    function Build_Tooltip_Text(Date_Value, Day_Items) {
        var Date_Text = Date_Value.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric"
        });

        if (Day_Items.length === 0) {
            return Date_Text + ": No items published";
        }

        var Article_Count = 0;
        var Match_Day_Count = 0;

        Day_Items.forEach(function (Publishing_Item) {
            if (Publishing_Item.collection === "content_articles") {
                Article_Count += 1;
            }

            if (Publishing_Item.collection === "content_match_days") {
                Match_Day_Count += 1;
            }
        });

        var Tooltip_Parts = [
            Date_Text + ": " + Day_Items.length + " item" + (Day_Items.length === 1 ? "" : "s") + " published"
        ];

        if (Article_Count > 0) {
            Tooltip_Parts.push(
                Article_Count + " article" + (Article_Count === 1 ? "" : "s")
            );
        }

        if (Match_Day_Count > 0) {
            Tooltip_Parts.push(
                Match_Day_Count + " match day" + (Match_Day_Count === 1 ? "" : "s")
            );
        }

        return Tooltip_Parts.join(" · ");
    }

    //---------------------------------------------------------------------------------------------------------------#
    // Group all publication records by date and year
    // Returns the grouped publishing data
    //---------------------------------------------------------------------------------------------------------------#
    function Build_Publishing_Data(Publishing_Items) {
        var Items_By_Date = {};
        var Items_By_Year = {};

        Publishing_Items.forEach(function (Publishing_Item) {
            var Date_Key = Publishing_Item.date;
            var Publishing_Date = Parse_Local_Date(Date_Key);
            var Publishing_Year = Publishing_Date.getFullYear();

            if (!Items_By_Date[Date_Key]) {
                Items_By_Date[Date_Key] = [];
            }

            Items_By_Date[Date_Key].push(Publishing_Item);

            if (!Items_By_Year[Publishing_Year]) {
                Items_By_Year[Publishing_Year] = [];
            }

            Items_By_Year[Publishing_Year].push(Publishing_Item);
        });

        return {
            Items_By_Date: Items_By_Date,
            Items_By_Year: Items_By_Year
        };
    }

    //---------------------------------------------------------------------------------------------------------------#
    // Build one year of publishing activity
    // Returns the completed year container
    //---------------------------------------------------------------------------------------------------------------#
    function Build_Year_Calendar(Year, Publishing_Data) {
        var Year_Container = document.createElement("section");
        Year_Container.className = "publishing-activity-year";

        var Year_Header = document.createElement("div");
        Year_Header.className = "publishing-activity-year-header";

        var Year_Title = document.createElement("h2");
        Year_Title.className = "publishing-activity-year-title";

        var Year_Items = Publishing_Data.Items_By_Year[Year] || [];

        Year_Title.textContent =
            Year
            + " - "
            + Year_Items.length
            + " published";

        Year_Header.appendChild(Year_Title);

        var Calendar_Scroll = document.createElement("div");
        Calendar_Scroll.className = "publishing-activity-calendar-scroll";

        var Calendar_Layout = document.createElement("div");
        Calendar_Layout.className = "publishing-activity-calendar-layout";

        var Weekday_Labels = document.createElement("div");
        Weekday_Labels.className = "publishing-activity-weekday-labels";

        [
            "",
            "Mon",
            "",
            "Wed",
            "",
            "Fri",
            ""
        ].forEach(function (Weekday_Label) {
            var Weekday_Label_Element = document.createElement("div");
            Weekday_Label_Element.className = "publishing-activity-weekday-label";
            Weekday_Label_Element.textContent = Weekday_Label;

            Weekday_Labels.appendChild(Weekday_Label_Element);
        });

        var Calendar_Content = document.createElement("div");
        Calendar_Content.className = "publishing-activity-calendar-content";

        var Month_Labels = document.createElement("div");
        Month_Labels.className = "publishing-activity-month-labels";

        var Calendar = document.createElement("div");
        Calendar.className = "publishing-activity-calendar";

        var Calendar_Start_Date = Get_Calendar_Start_Date(Year);
        var Calendar_End_Date = Get_Calendar_End_Date(Year);
        var Calendar_Date = new Date(Calendar_Start_Date);

        var Week_Count = Math.round(
            (
                Calendar_End_Date.getTime()
                - Calendar_Start_Date.getTime()
            )
            / 604800000
        ) + 1;

        Calendar.style.setProperty("--publishing-activity-week-count", Week_Count);
        Month_Labels.style.setProperty("--publishing-activity-week-count", Week_Count);

        var Previous_Month = -1;

        while (Calendar_Date <= Calendar_End_Date) {
            var Date_Key = Format_Date_Key(Calendar_Date);
            var Day_Items = Publishing_Data.Items_By_Date[Date_Key] || [];
            var Day_Cell = document.createElement("div");

            Day_Cell.className =
                "publishing-activity-day publishing-activity-level-"
                + Get_Activity_Level(Day_Items.length);

            Day_Cell.setAttribute("data-date", Date_Key);
            Day_Cell.setAttribute("data-count", Day_Items.length);
            Day_Cell.setAttribute("title", Build_Tooltip_Text(Calendar_Date, Day_Items));

            if (Calendar_Date.getFullYear() !== Year) {
                Day_Cell.classList.add("publishing-activity-day-outside-year");
            }

            if (
                Calendar_Date.getFullYear() === Year
                && Calendar_Date.getMonth() !== Previous_Month
            ) {
                var Month_Week_Index = Math.floor(
                    (
                        Calendar_Date.getTime()
                        - Calendar_Start_Date.getTime()
                    )
                    / 604800000
                ) + 1;

                var Month_Label = document.createElement("div");
                Month_Label.className = "publishing-activity-month-label";
                Month_Label.style.gridColumnStart = Month_Week_Index;
                Month_Label.textContent = Calendar_Date.toLocaleDateString(undefined, {
                    month: "short"
                });

                Month_Labels.appendChild(Month_Label);
                Previous_Month = Calendar_Date.getMonth();
            }

            Calendar.appendChild(Day_Cell);
            Calendar_Date.setDate(Calendar_Date.getDate() + 1);
        }

        Calendar_Content.appendChild(Month_Labels);
        Calendar_Content.appendChild(Calendar);

        Calendar_Layout.appendChild(Weekday_Labels);
        Calendar_Layout.appendChild(Calendar_Content);

        Calendar_Scroll.appendChild(Calendar_Layout);

        Year_Container.appendChild(Year_Header);
        Year_Container.appendChild(Calendar_Scroll);

        return Year_Container;
    }

    
        //---------------------------------------------------------------------------------------------------------------#
    // Render the complete all-time publishing activity display
    //---------------------------------------------------------------------------------------------------------------#
    function Render_Publishing_Activity(Activity_Container, Publishing_Items) {
        var Summary_Container = Activity_Container.querySelector(".publishing-activity-summary");
        var Calendars_Container = Activity_Container.querySelector(".publishing-activity-calendars");

        if (Publishing_Items.length === 0) {
            Summary_Container.innerHTML = "<p>No published content found.</p>";
            return;
        }

        Publishing_Items.sort(function (First_Item, Second_Item) {
            return First_Item.date.localeCompare(Second_Item.date);
        });

        var Publishing_Data = Build_Publishing_Data(Publishing_Items);
        var First_Date = Parse_Local_Date(Publishing_Items[0].date);
        var Last_Date = Parse_Local_Date(Publishing_Items[Publishing_Items.length - 1].date);
        var First_Year = First_Date.getFullYear();
        var Last_Year = Last_Date.getFullYear();

        Summary_Container.innerHTML = "";

        var Summary_Layout = document.createElement("div");
        Summary_Layout.className = "publishing-activity-summary-layout";

        var Summary_Text = document.createElement("p");
        Summary_Text.className = "publishing-activity-summary-text";
        
        Summary_Text.textContent =
            Publishing_Items.length
            + " Articles and Match Day Coverage Published since "
            + First_Date.toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric"
            });

        var Legend = document.createElement("div");
        Legend.className = "publishing-activity-legend";

        var Legend_Less = document.createElement("span");
        Legend_Less.textContent = "Less";

        var Legend_More = document.createElement("span");
        Legend_More.textContent = "More";

        Legend.appendChild(Legend_Less);

        for (var Level = 0; Level <= 4; Level += 1) {
            var Legend_Cell = document.createElement("span");

            Legend_Cell.className =
                "publishing-activity-day publishing-activity-level-"
                + Level;

            Legend.appendChild(Legend_Cell);
        }

        Legend.appendChild(Legend_More);

        Summary_Layout.appendChild(Summary_Text);
        Summary_Layout.appendChild(Legend);

        Summary_Container.appendChild(Summary_Layout);
        Calendars_Container.innerHTML = "";

        for (var Year = Last_Year; Year >= First_Year; Year -= 1) {
            var Year_Items = Publishing_Data.Items_By_Year[Year] || [];

            if (Year_Items.length === 0) {
                continue;
            }

            Calendars_Container.appendChild(
                Build_Year_Calendar(Year, Publishing_Data)
            );
        }
    }


    //---------------------------------------------------------------------------------------------------------------#
    // Initialize every publishing activity component on the page
    //---------------------------------------------------------------------------------------------------------------#
    function Initialize_Publishing_Activity() {
        var Activity_Containers = document.querySelectorAll(".publishing-activity");

        Activity_Containers.forEach(function (Activity_Container) {
            var Data_Element = Activity_Container.nextElementSibling;

            if (
                !Data_Element
                || !Data_Element.classList.contains("publishing-activity-data")
            ) {
                return;
            }

            try {
                var Publishing_Items = JSON.parse(Data_Element.textContent);
                Render_Publishing_Activity(Activity_Container, Publishing_Items);
            } catch (Error_Object) {
                console.error("Could not load publishing activity data.", Error_Object);

                var Summary_Container = Activity_Container.querySelector(".publishing-activity-summary");

                Summary_Container.innerHTML =
                    "<p>Could not load publishing activity.</p>";
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", Initialize_Publishing_Activity);
    } else {
        Initialize_Publishing_Activity();
    }
})();