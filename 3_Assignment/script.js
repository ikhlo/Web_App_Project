//current movie informations 
var movie = "Antebellum";
var movieid = "627290";
var releaseYear = null;

//current person informations
var people = "";
var peopleid = null;

var casting = {}; //casting of the current movie
var played_movies = {}; // played movie of the current person
var movies_used = []; // all movies already entered by a user

//count variable used for displaying element successively
var human_count = 0;
var movie_count = 0;

const key = "27294941b248f6c55d4927966b7c5815";

const base_img = "https://image.tmdb.org/t/p/w400";

//function used to display an image
function display_img(src, width, height, element) {
    var img = document.createElement("img");
    img.src = src;
    img.width = width;
    img.height = height;

    document.getElementsByClassName(element)[0].appendChild(img);
}

//function to display a movie and its informations while retrieving its casting
async function display_movie(element){
    var url_movie = `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${movie}&primary_release_year=${releaseYear}`;
    fetch(url_movie).then(function(response){
        if(response.status != 200){
            console.log("Error: " + response.status);
            return;
        }else{
            response.json().then(async function(data){
                casting = await save_casting();
                console.dir(casting);

                document.getElementsByClassName(element)[0].innerHTML = `<h2> ${data.results[0]['original_title']} </h2>`;
                display_img(base_img + data.results[0]['poster_path'], 150, 250, element);
                document.getElementsByClassName(element)[0].innerHTML += `<h4> ${data.results[0]['release_date']} </h4>`;
            });
        }
    });
}

//function to get the casting of a movie
async function save_casting(){
    var url_casting = `https://api.themoviedb.org/3/movie/${movieid}/credits?api_key=${key}&language=en-US`
    let casting = fetch(url_casting).then(function(response){
        if(response.status != 200){
            console.log("Error: " + response.status);
            return;
        }else{
            let result = response.json().then(function(data){
                let casting_temp = {};
                data.cast.forEach(elm =>{
                    casting_temp[elm['original_name'].toLowerCase()]= {"id": elm["id"], "img": elm["profile_path"]};
                });

                data.crew.forEach(elm =>{
                    if (elm['job'] == "Director"){
                        casting_temp[elm['original_name'].toLowerCase()]= {"id": elm["id"], "img": elm["profile_path"]};
                    }
                });
                return casting_temp;
            });
            return result;
        }
    });
    return casting;
}

//////////////////////////////////////////////////////////////////////////////

//function to display a person and its informations while retrieving movies in which he contribute
async function display_character(element){
    let human = casting[people];
    document.getElementsByClassName(element)[0].innerHTML = `<h2> ${people} </h2>`;
    display_img(base_img + human['img'], 150, 250, element);
    document.getElementsByClassName(element)[0].innerHTML += `<h4></h4>`
    played_movies = await save_movies();
    console.dir(played_movies);
}

//function to get back contribute movies of a person
async function save_movies(){
    var url_playing = `https://api.themoviedb.org/3/person/${peopleid}/movie_credits?api_key=${key}&language=en-US`;

    let played_movies = fetch(url_playing).then(function(response){
        if(response.status != 200){
            console.log("Error: " + response.status);
            return;
        }else{
            let result = response.json().then(function(data){
                let playedmovies_temp = {};
                data.cast.forEach(elm =>{
                    playedmovies_temp[elm['original_title'].toLowerCase()] = elm['id'];
                });

                return playedmovies_temp;
            });
            return result;
        }
    });
    return played_movies;
}

//////////////////////////////////////////////////////////////////////////////////

// function to test people user's answer and display next question
async function find_people(){
    let response = document.getElementById(`people_form_${movie_count}`).value;
    response = response.toLowerCase();

    if (Object.keys(casting).includes(response)){
        people = response;
        peopleid = casting[people]["id"];
        document.getElementsByClassName(`movie_${movie_count}`)[0].innerHTML += `<h3 style='color: green'> Correct ANSWER</h3>`;
        document.body.innerHTML += `<div class="human_${human_count}"></div>

        <div>
            <form action="" method="post" onsubmit="return false">
                <label for="movie_form_${movie_count}">Full title :</label>
                <input type="text" id="movie_form_${movie_count}" name="movie" placeholder="Movie in which this people contribute">
                <button type="submit" onClick="find_movie()">Send answer</button>
            </form>
        </div>`;
        display_character(`human_${human_count}`);
        movie_count +=1;
        console.dir(played_movies);
    }
    else{
        if(document.querySelector(`.movie_${movie_count} h3`)){
        document.querySelector(`.movie_${movie_count} h3`).innerHTML += `!`;
        }else{
            let h = document.createElement("h3");
            h.style.color = 'red';
            document.getElementsByClassName(`movie_${movie_count}`)[0].append(h);
            document.querySelector(`.movie_${movie_count} h3`).innerHTML += `WRONG ANSWER !`;
        }
    }
}

// function to test movie user's answer and display next question
async function find_movie(){
    let response = document.getElementById(`movie_form_${human_count}`).value;
    response = response.toLowerCase();
    
    if (movies_used.includes(response)){

        if (document.querySelector(`.human_${human_count} h4`)){
            document.querySelector(`.human_${human_count} h4`).innerHTML += `!`;
        }
        else{
        let h = document.createElement("h4");
        h.style.color = 'blue';
        document.getElementsByClassName(`human_${human_count}`)[0].append(h);
        document.querySelector(`.human_${human_count} h4`).innerHTML += `This movie has already been entered !`;
        }
    }

    else if (Object.keys(played_movies).includes(response)){
        movies_used.push(response);
        movie = response;
        movieid = played_movies[movie];
        document.getElementsByClassName(`human_${human_count}`)[0].innerHTML += `<h3 style='color: green'> Correct ANSWER</h3>`;
        document.body.innerHTML += `<div class="movie_${movie_count}"></div>

        <div>
            <form action="" method="post" onsubmit="return false">
                <label for="people_form_${movie_count}">Full name :</label>
                <input type="text" id="people_form_${movie_count}" name="movie" placeholder="Actor or director of this movie">
                <button type="submit" onClick="find_people()">Send answer</button>
            </form>
        </div>`;
        display_movie(`movie_${movie_count}`);
        human_count +=1;
        console.dir(casting);
    }

    else{
        if (document.querySelector(`.human_${human_count} h3`)){
            document.querySelector(`.human_${human_count} h3`).innerHTML += `!`;
        }
        else{
        let h = document.createElement("h3");
        h.style.color = 'red';
        document.getElementsByClassName(`human_${human_count}`)[0].append(h);
        document.querySelector(`.human_${human_count} h3`).innerHTML += `WRONG ANSWER !`;
        }
    }
}

//starting function
display_movie('movie_0');