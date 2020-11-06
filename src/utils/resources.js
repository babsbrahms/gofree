export const absolutePermission = {
    administration: {
         // AND
        department: true, 
        team: true,
        role: true
    },
    task: { // OR
        control: true
    },
    project: { // OR
        control: 'multiple' //'single', 'multiple'
    },
    suggestion: { // OR
        review: 'all', //'none', 'management', 'department', 'all'
    },
    announcement: {
        create: 'multiple' //'single', 'multiple' or 'none'
    },
}


export const adminCreate = (type, team) => {
    switch (type) {
        case 'department':
            return {
                name: '',
                workspaceId: team.workspaceId,
                createdBy: team.userId,
            }
        case 'role':
            return {
                title: '',
                permission: absolutePermission,
                createdAt: '',
                createdBy: team.userId,
                workspaceId: team.workspaceId,
            }
    
        case 'team':
            return {
                email: '',
                roleId: '',
                roleTitle: "",
                departmentId: '',
                departmentName: "",
                userId: "",
                name: "",
                photoUrl: "",
                workspaceId: team.workspaceId,
                workspaceName: team.workspaceName,
                createdBy: team.userId,
                createdAt: "",
                owner: false,
                accepted: false
            }
        default:
            return {

            }
    }
}       


export const widgetName = {
    "announcement": "Announcement",
    "project": "Project", 
    "administration": "Administration",
    "task": "My Task",
    "suggestion": "Suggestion Box",
}

export const widgetDescription = {
    "announcement": "Share information with team members.",
    "project": "Collaborate with departments on projects. Create, manage and delegate tasks.", 
    "administration": "Manage departments, and team member's role by assigning widgets and configuring their permissions.",
    "task": "Manage tasks assigned to you from the project widget.",
    "suggestion": "Create and review suggestions.",
}

export const permissionRole = [
    {
        key: "announcement",
        text: widgetName['announcement'],
        value: "announcement",
        description: 'Share information with departments',
    },
    {
        key: "administration",
        text: widgetName['administration'],
        value: "administration",
        description: 'Manage teams, departments and roles',
    },
    {
        key: "project",
        text: widgetName['project'],
        value: "project",
        description: 'Collaborate on projects and manage tasks',
    },
    {
        key: "task",
        text: widgetName['task'],
        value: "task",
        description: 'Manage assigned tasks',
    },
    {
        key: "suggestion",
        text: widgetName['suggestion'],
        value: "suggestion",
        description: 'Create and review suggestions',
    },
];

export const getSubAmmount = (users) => {
    let amount = 0
    if (users > 0 && users <= 49) {
        amount = users * 150000
    } else if (users >= 50 && users <= 149) {
        amount = users * 135000
    } else if (users >= 150) {
        amount = users * 120000
    }

    return amount
}

export const getSubCostPerUser = (users) => {
    if (users > 0 && users <= 49) {
        return `${1500} NGN `
    } else if (users >= 50 && users <= 149) {
        return `${1350} NGN`
    } else if (users >= 150) {
        return  `${1200} NGN`
    }
}


export const CSVToArray = ( strData, strDelimiter ) => {
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");

    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
        (
            // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"
        ),
        "gi"
        );


    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [[]];

    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;


    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec( strData )){

        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[ 1 ];

        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (
            strMatchedDelimiter.length &&
            (strMatchedDelimiter !== strDelimiter)
            ){

            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push( [] );

        }


        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[ 2 ]){

            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            var strMatchedValue = arrMatches[ 2 ].replace(
                new RegExp( "\"\"", "g" ),
                "\""
                );

        } else {

            // We found a non-quoted value.
            var strMatchedValue = arrMatches[ 3 ];

        }


        // Now that we have our value string, let's add
        // it to the data array.
        arrData[ arrData.length - 1 ].push( strMatchedValue );
    }

    // Return the parsed data.
    return( arrData );
}


export const getUrlParams = (params = "") => {
    let obj = {};
    if (params && params.startsWith("?")) {
        let vals = params.slice(1)
        vals.split("&").forEach(str => {
            obj[str.split("=")[0]] = str.split("=")[1]
        })
    }
    return obj
}