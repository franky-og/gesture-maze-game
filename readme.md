# Maze Gesture Game

## ABOUT
This project is an interactive game where the player uses gestures through the webcam to solve a maze. The maze is generated using a recursive backtracker. The player navigates the maze by doing gestures into the webcam that are then interpreted with a KNN Classifier that uses webcam image data that the player submits at the beginning on the game. The maze has 3 difficulties. On completion, the player is asked to submit their score which is saved in a PostGRESQL database via Ruby on Rails.

#### Backend

https://github.com/franky-og/maze-game-backend