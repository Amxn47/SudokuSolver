document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('sudokuGrid').getElementsByTagName('tbody')[0];
    let solving = false; // Flag to control solving process

    // Create 9x9 Sudoku grid
    for (let i = 0; i < 9; i++) {
            const row = grid.insertRow();
            for (let j = 0; j < 9; j++) {
                const cell = row.insertCell();
                const input = document.createElement('input');
                input.type = 'text';
                input.maxLength = 1;
                cell.appendChild(input);

                // Determine the sub-grid color class
                const subgridRow = Math.floor(i / 3);
                const subgridCol = Math.floor(j / 3);
                const subgridIndex = subgridRow * 3 + subgridCol + 1;

                // Assign colors based on sub-grid index
                if ([1, 3, 5, 7, 9].includes(subgridIndex)) {
                    cell.classList.add('subgrid1');
                } else {
                    cell.classList.add('subgrid2');
                }
            }
        }
    function setUserInteraction(enabled) {
        const inputs = document.querySelectorAll('#sudokuGrid input');
        inputs.forEach(input => {
            input.disabled = !enabled;
        });
    }

    function getBoard() {
        const inputs = document.querySelectorAll('#sudokuGrid input');
        return Array.from(inputs).map(input => parseInt(input.value) || 0);
    }

    async function solveSudoku() {
        solving = true;
        setUserInteraction(false); // Disable user interaction

        const board = getBoard();
        const response = await fetch('/solve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ board })
        });

        const result = await response.json();
        if (result.success) {
            const solvedBoard = result.board;
            const inputs = document.querySelectorAll('#sudokuGrid input');

            let index = 0;
            function animateSolve() {
                if (index >= inputs.length || !solving) {
                    setUserInteraction(true); // Re-enable user interaction
                    return;
                }

                const input = inputs[index];
                input.classList.add('animate-solve');
                input.value = solvedBoard[index];
                index++;
                setTimeout(animateSolve, 100);  // Speed of animation
            }

            animateSolve();
        } else {
            // Handle solving error
            alert('Failed to solve Sudoku.');
        }
    }

    function resetBoard() {
        solving = false; // Stop solving
        setUserInteraction(true); // Re-enable user interaction

        const grid = document.getElementById('sudokuGrid');
        let inputs = grid.getElementsByTagName('input');

        // Remove animation class and clear inputs
        for (let input of inputs) {
            input.value = '';
            input.classList.remove('error');
            input.classList.remove('animate-solve'); // Remove the animation class
        }

        hideMessage();
    }

    function hideMessage() {
        const messageElement = document.getElementById('message');
        if (messageElement) {
            messageElement.style.display = 'none';
        }
    }

    function checkErrors() {
        const grid = document.getElementById('sudokuGrid');
        let inputs = grid.getElementsByTagName('input');
        let errorFound = false;

        // Clear previous errors
        for (let input of inputs) {
            input.classList.remove('error');
        }

        // Check rows, columns, and subgrids for duplicates
        const size = 9;
        const subgridSize = 3;
        const values = Array.from(inputs).map(input => input.value);

        function isDuplicate(arr) {
            const filtered = arr.filter(value => value);
            return new Set(filtered).size !== filtered.length;
        }

        // Check rows
        for (let r = 0; r < size; r++) {
            const row = [];
            for (let c = 0; c < size; c++) {
                row.push(values[r * size + c]);
            }
            if (isDuplicate(row)) {
                row.forEach((value, idx) => {
                    if (value) {
                        inputs[r * size + idx].classList.add('error');
                        errorFound = true;
                    }
                });
            }
        }

        // Check columns
        for (let c = 0; c < size; c++) {
            const column = [];
            for (let r = 0; r < size; r++) {
                column.push(values[r * size + c]);
            }
            if (isDuplicate(column)) {
                column.forEach((value, idx) => {
                    if (value) {
                        inputs[idx * size + c].classList.add('error');
                        errorFound = true;
                    }
                });
            }
        }

        // Check subgrids
        for (let subgridRow = 0; subgridRow < subgridSize; subgridRow++) {
            for (let subgridCol = 0; subgridCol < subgridSize; subgridCol++) {
                const subgrid = [];
                for (let r = 0; r < subgridSize; r++) {
                    for (let c = 0; c < subgridSize; c++) {
                        subgrid.push(values[(subgridRow * subgridSize + r) * size + (subgridCol * subgridSize + c)]);
                    }
                }
                if (isDuplicate(subgrid)) {
                    subgrid.forEach((value, idx) => {
                        if (value) {
                            const r = Math.floor(idx / subgridSize) + subgridRow * subgridSize;
                            const c = idx % subgridSize + subgridCol * subgridSize;
                            inputs[r * size + c].classList.add('error');
                            errorFound = true;
                        }
                    });
                }
            }
        }

        // Show error message if any errors found
        if (errorFound) {
            const messageElement = document.getElementById('message');
            if (messageElement) {
                messageElement.style.display = 'block';
                messageElement.textContent = 'Please reenter the wrong inputs.';
            }
        } else {
            hideMessage();
        }
    }

    // Function to handle input changes
    function handleInputChange(event) {
        const input = event.target;

        // Allow only numbers from 1 to 9
        if (!/^[1-9]$/.test(input.value)) {
            input.value = '';
        }

        // Check for errors immediately
        checkErrors();
    }

    // Event listeners for buttons
    document.getElementById('solveButton').addEventListener('click', () => {
        checkErrors();
        if (!solving) {
            solveSudoku();
        }
    });

    document.getElementById('resetButton').addEventListener('click', resetBoard);

    // Allow users to click anywhere to clear the error message
    document.querySelectorAll('#sudokuGrid input').forEach(input => {
        input.addEventListener('click', hideMessage);
        input.addEventListener('input', handleInputChange);
    });
});
