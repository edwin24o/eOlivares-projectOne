document.addEventListener("DOMContentLoaded", function() {
    const categoryFilter = document.querySelector('#category-filter');
    const difficultyFilter = document.querySelector('#difficulty-filter');
    const addExerciseForm = document.querySelector('#add-exercise-form');
    const addExerciseBtn = document.querySelector('#add-exercise-btn');

    fetchExercises();

    categoryFilter.addEventListener('change', fetchExercises);
    difficultyFilter.addEventListener('change', fetchExercises);
    addExerciseBtn.addEventListener('click', addExercise);
    addExerciseForm.addEventListener('submit', function(event) {
        event.preventDefault();
        addExercise();
    });
    
    document.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            addExercise(event);
        }
    });

function fetchExercises() {
    const category = categoryFilter.value;
    const difficulty = difficultyFilter.value;

    fetch('http://localhost:3000/exercises')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Sort exercises by likes in descending order
            data.sort((a, b) => b.likes - a.likes);
            // Filter exercises based on category and difficulty
            const filteredExercises = data.filter(exercise => {
                return (category === 'All' || exercise.category === category) &&
                       (difficulty === 'All' || exercise.difficulty === difficulty);
            });
            displayExercises(filteredExercises);
        })
        .catch(error => {
            console.error('There was a problem fetching the data:', error);
        });
}

    function displayExercises(exercises) {
        const exerciseListDiv = document.querySelector('#exercise-list');
        exerciseListDiv.innerHTML = ''; // Clear previous exercise display
    
        exercises.forEach(exercise => {
            const exerciseDiv = document.createElement('div');
            exerciseDiv.classList.add('exercise-card');
            exerciseDiv.innerHTML = `
                <h2>${exercise.name}</h2>
                <p>Category: ${exercise.category}</p>
                <p>Difficulty: ${exercise.difficulty}</p>
                <div class="like-dislike">
                    <button class="like-btn" data-exercise-id="${exercise.id}">Like</button>
                    <span class="likes">Likes: ${exercise.likes}</span>
                    <button class="dislike-btn" data-exercise-id="${exercise.id}">Dislike</button>
                    <span class="dislikes">Dislikes: ${exercise.dislikes}</span>
                </div>
            `;
            exerciseListDiv.appendChild(exerciseDiv);
    
           
            exerciseDiv.addEventListener('click', function() {
                displaySingleExercise(exercise);
            });
    
            const likeBtn = exerciseDiv.querySelector('.like-btn');
            const dislikeBtn = exerciseDiv.querySelector('.dislike-btn');
    
            likeBtn.addEventListener('click', function(event) {
                event.stopPropagation(); 
                handleLike(exercise.id);
            });
    
            dislikeBtn.addEventListener('click', function(event) {
                event.stopPropagation(); 
                handleDislike(exercise.id);
            });
        });
    }

    function addExercise(event) {
        event.preventDefault(); // Prevent form submission
    
        const exerciseName = document.querySelector('#exercise-name').value;
        const exerciseCategory = document.querySelector('#exercise-category').value;
        const exerciseDifficulty = document.querySelector('#exercise-difficulty').value;
        const exerciseImage = document.querySelector('#exercise-image').value;
        const exerciseDescription = document.querySelector('#exercise-description').value;
        
        fetch('http://localhost:3000/exercises', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: exerciseName,
                category: exerciseCategory,
                difficulty: exerciseDifficulty,
                imageUrl: exerciseImage,
                description: exerciseDescription,
                likes: 0,
                dislikes: 0
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Exercise added:', data);
            fetchExercises(); // Refresh the exercise list
        })
        .catch(error => {
            console.error('Error adding exercise:', error);
        });
    }
    

    function handleLike(exerciseId) {
        fetch(`http://localhost:3000/exercises/${exerciseId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const updatedLikes = data.likes + 1;
                return fetch(`http://localhost:3000/exercises/${exerciseId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        likes: updatedLikes
                    })
                });
            })
            .then(response => response.json())
            .then(data => {
                fetchExercises(); // Refresh the exercise list
            })
            .catch(error => {
                console.error('Error updating likes:', error);
            });
    }

    function handleDislike(exerciseId) {
        fetch(`http://localhost:3000/exercises/${exerciseId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const updatedDislikes = data.dislikes + 1;
                return fetch(`http://localhost:3000/exercises/${exerciseId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        dislikes: updatedDislikes
                    })
                });
            })
            .then(response => response.json())
            .then(data => {
                fetchExercises(); // Refresh the exercise list
            })
            .catch(error => {
                console.error('Error updating dislikes:', error);
            });
    }

    function displaySingleExercise(exercise) {
        const exerciseListDiv = document.querySelector('#exercise-list');
        exerciseListDiv.innerHTML = ''; 
        const exerciseDiv = document.createElement('div');
        exerciseDiv.classList.add('exercise-card');
        exerciseDiv.innerHTML = `
            <h2>${exercise.name}</h2>
            <p>Category: ${exercise.category}</p>
            <p>Difficulty: ${exercise.difficulty}</p>
            <p>Description: ${exercise.description}</p>
            <img src="${exercise.imageUrl}" alt="${exercise.name}">
            <div class="like-dislike">
                <button class="like-btn">Like</button>
                <span class="likes">Likes: ${exercise.likes}</span>
                <button class="dislike-btn">Dislike</button>
                <span class="dislikes">Dislikes: ${exercise.dislikes}</span>
            </div>
             
        `;
        exerciseListDiv.appendChild(exerciseDiv);
    }
});