package com.amxn.sudoku.solver;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/solve")
public class SudokuController {

    @PostMapping
    public SudokuResponse solveSudoku(@RequestBody SudokuRequest request) {
        int[][] board = new int[9][9];
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                board[i][j] = request.getBoard()[i * 9 + j];
            }
        }

        SudokuSolver solver = new SudokuSolver();
        boolean solved = solver.solveSudoku(board);

        if (solved) {
            int[] flatBoard = new int[81];
            for (int i = 0; i < 9; i++) {
                for (int j = 0; j < 9; j++) {
                    flatBoard[i * 9 + j] = board[i][j];
                }
            }
            return new SudokuResponse(true, flatBoard);
        } else {
            return new SudokuResponse(false, null);
        }
    }

    // Inner class for request
    public static class SudokuRequest {
        private int[] board;

        // Getters and Setters
        public int[] getBoard() {
            return board;
        }

        public void setBoard(int[] board) {
            this.board = board;
        }
    }

    // Inner class for response
    public static class SudokuResponse {
        private boolean success;
        private int[] board;

        public SudokuResponse(boolean success, int[] board) {
            this.success = success;
            this.board = board;
        }

        // Getters and Setters
        public boolean isSuccess() {
            return success;
        }

        public void setSuccess(boolean success) {
            this.success = success;
        }

        public int[] getBoard() {
            return board;
        }

        public void setBoard(int[] board) {
            this.board = board;
        }
    }
}
