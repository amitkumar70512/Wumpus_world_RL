
flag = 0;
environment_rows = 5;
environment_columns = 5;
var speed = 10;

episodes = 50;

epsilon = 0.5;
discount_factor = 0.8;

start = [];
hole1 = [];
hole2 = [];
hole3 = [];
wall = [];
goal = [];

rewards = new Array(environment_rows);

q_values = new Array(environment_rows);

actions = ['up', 'right', 'down', 'left'];


var speedbar = document.getElementById('speed');
speedbar.onclick=function(){
    speed = document.getElementById('speed').value
}

var episodeinput = document.getElementById('episodes');
episodeinput.onkeyup=function(){
episodes = episodeinput.value;
console.log(episodeinput.value)
}


function is_terminal_state(current_row_index, current_column_index) {
    if (rewards[current_row_index][current_column_index] == -1) {
        return false;
    }
    return true
}

function get_next_action(current_row_index, current_column_index, epsilon) {
    if (Math.random() < epsilon) {
        return q_values[current_row_index][current_column_index].indexOf(Math.max.apply(Math, q_values[current_row_index][current_column_index]));
    } else {
        return Math.floor(Math.random() * 4);
    }
}

function get_next_location(current_row_index, current_column_index, action_index) {
    var new_row_index = current_row_index;
    var new_column_index = current_column_index;

    if (actions[action_index] == 'up' && current_row_index > 0) {
        new_row_index -= 1;
    } else if (actions[action_index] == 'right' && current_column_index < environment_columns - 1) {
        new_column_index += 1;
    } else if (actions[action_index] == 'down' && current_row_index < environment_rows - 1) {
        new_row_index += 1;
    } else  if (actions[action_index] == 'left' && current_column_index > 0) {
        new_column_index -= 1;
    }

    return [new_row_index, new_column_index];
}
/// animations
function delay_hide(id){
    document.getElementById(id).style.visibility='hidden';
}
function show_ele(id)
{
    document.getElementById(id).style.visibility='visible';
}
function show_toast(){
    show_ele('toast_header')
document.getElementById("toast_header").style.animationName='toast_display';
}
function close_toast(){
    delay_hide('toast_header');
    document.getElementById("toast_header").style.animationName='';
}
/// function to run training
async function run(id) {
    if (document.getElementById(id).textContent == 'Run') {
        for (var i = 0; i < rewards.length; i++) {
            rewards[i] = new Array(environment_columns);
        }
        for (var i = 0; i < environment_rows; i++) {
            for (var j = 0; j < environment_columns; j++) {
                rewards[i][j] = -1;
            }
        }
        rewards[hole1[0]][hole1[1]] = -100;
        rewards[hole2[0]][hole2[1]] = -100;
        rewards[hole3[0]][hole3[1]] = -100;
        rewards[wall[0]][wall[1]] = -100;
        rewards[goal[0]][goal[1]] = 100;
        show_ele('q_table')
        delay_hide(id);
        show_toast();
        for (var i = 0; i < q_values.length; i++) {
            q_values[i] = new Array(environment_columns);
        }
        for (var i = 0; i < environment_rows; i++) {
            for (var j = 0; j < environment_columns; j++) {
                q_values[i][j] = new Array(4);
            }
        }
        for (var i = 0; i < environment_rows; i++) {
            for (var j = 0; j < environment_columns; j++) {
                for (var k = 0; k < 4; k++) {
                    q_values[i][j][k] = 0;
                }
            }
        }


        for (var i = 0; i < episodes; i++) 
        {
            var row_index = start[0];
            var column_index = start[1];

            // for (var k = 0; k < environment_rows; k++) {
            //     for (var j = 0; j < environment_columns; j++) {
            //         document.getElementById(k.toString() + j.toString()).innerHTML = '';
            //     }
            // }

            document.getElementById("index").innerHTML = 'episode: ' + (i+1).toString();

            while (!is_terminal_state(row_index, column_index)) {

                document.getElementById(row_index.toString() + column_index.toString()).innerHTML = '<img src="pac.png" alt="" width="50" height="50">';

                var action_index = get_next_action(row_index, column_index, epsilon);

                var old_row_index = row_index;
                var old_column_index = column_index;

                row_index = get_next_location(row_index, column_index, action_index)[0];
                column_index = get_next_location(row_index, column_index, action_index)[1];

                var reward = rewards[row_index][column_index];

                var new_q_value = reward + (discount_factor * Math.max.apply(Math, q_values[row_index][column_index]));

                q_values[old_row_index][old_column_index][action_index] = new_q_value;

                document.getElementById('t' + old_row_index.toString() + old_column_index.toString() + action_index.toString()).innerHTML = Math.floor(new_q_value).toString();

                await sleep((51-speed)*10);

                document.getElementById(old_row_index.toString() + old_column_index.toString()).innerHTML = '';
            }
        }
        document.getElementById(start[0].toString() + start[1].toString()).innerText = 'START';
        document.getElementById("shortest_path").innerHTML = 'See the shortest path';
        document.getElementById("shortest_path").setAttribute("style", "color: blue; text-align: center; font-size: 24px; padding: 1rem; cursor: pointer;");
        close_toast();   
    }
}
// training is done here..

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function get_shortest_path() {
    var start_row_index = start[0];
    var start_column_index = start[1];
    if (is_terminal_state(start_row_index, start_column_index)) {
        return [];
    } else {
        var current_row_index = start_row_index;
        var current_column_index = start_column_index;
        var shortest_path = [];
        shortest_path.push([current_row_index, current_column_index]);

        while (!is_terminal_state(current_row_index, current_column_index)) {
            var action_index = get_next_action(current_row_index, current_column_index, 1);

            current_row_index = get_next_location(current_row_index, current_column_index, action_index)[0];
            current_column_index = get_next_location(current_row_index, current_column_index, action_index)[1];

            shortest_path.push([current_row_index, current_column_index]);
        }
        return shortest_path;
    }
}

function startPlay() {
    var shortest_path = get_shortest_path();
    var i = 0;
    document.getElementById("define").innerHTML="";
    var interval = setInterval(function () {
        for (var j = 0; j < i; j++) {
            document.getElementById(shortest_path[j][0].toString() + shortest_path[j][1].toString()).innerHTML = '';
        }
        document.getElementById(shortest_path[0][0].toString() + shortest_path[0][1].toString()).innerText = 'START';
        document.getElementById(shortest_path[i][0].toString() + shortest_path[i][1].toString()).innerHTML = '<img src="pac.png" alt="" width="50" height="50">';
        document.getElementById("define").innerHTML += "["+shortest_path[i][0]+","+shortest_path[i][1]+"]";
        document.getElementById("define").setAttribute("style", "color: white; text-align: center; font-size: 24px; padding: 1rem; cursor: pointer;");
        i = i + 1;
        if (i == shortest_path.length) {
            clearInterval(interval);
        }
    }, 500);
}

function onClick(id) {
    if (flag == 0)
    {
        start.push(parseInt(parseInt(id)/10));
        start.push(parseInt(parseInt(id)%10));
        document.getElementById(id).textContent="START";
        document.getElementById(id).setAttribute("style", "background-color: greenyellow;");
        flag += 1;
        document.getElementById("define").innerHTML = 'Define hole' + flag + ' point:';
    } 
    else if (flag == 1 || flag == 2 || flag==3)
    {
        if (flag == 1) {
            hole1.push(parseInt(parseInt(id) / 10));
            hole1.push(parseInt(parseInt(id) % 10));
        }
        else if (flag == 2) {
            hole2.push(parseInt(parseInt(id) / 10));
            hole2.push(parseInt(parseInt(id) % 10));
        }
        else if (flag == 3) {
            hole3.push(parseInt(parseInt(id) / 10));
            hole3.push(parseInt(parseInt(id) % 10));
        }
        //document.getElementById(id).innerHTML='<img src="hole.png" alt="" width="50" height="50">';
        document.getElementById(id).innerText='HOLE';
        document.getElementById(id).setAttribute("style", "background-color: black;color:white;");
        flag += 1;
        if (flag==2)
            document.getElementById("define").innerHTML = 'Define hole' + flag + ' point:'; 
        else if (flag == 3)
            document.getElementById("define").innerHTML = 'Define hole' + flag + ' point:';
        else if (flag == 4)
            document.getElementById("define").innerHTML = 'Define wumpus  <i class="fa-solid fa-robot"></i>';
    } else if (flag == 4){
        wall.push(parseInt(parseInt(id) / 10));
        wall.push(parseInt(parseInt(id) % 10));
        document.getElementById(id).innerHTML='<img src="media/ghost.gif" alt="" width="50" height="50">';
        document.getElementById(id).setAttribute("style", "background-color: black ;color:white");
        document.getElementById("define").innerHTML = 'Define goal point:';
        flag += 1;
    } else if (flag == 5 && document.getElementById(id).textContent == ''){
        goal.push(parseInt(parseInt(id) / 10));
        goal.push(parseInt(parseInt(id) % 10));
        document.getElementById(id).innerText='GOAL';
        document.getElementById(id).setAttribute("style", "background-color: gold;");
        flag = -1;
        document.getElementById("define").innerHTML = 'Run';
    }
}
