# Tavli

Modern backgammon.

## Running

To fetch packages first:

``` mrt update ```

To run:

``` meteor ```

## TODO

**Features**

* Roll per turn
* Moving items off the board
* Winning
* Undo
* Friend search
* Friend requests
* Roll validation (e.g. two turns per role)
* Prevent moving other items if you have items in limbo
* Move validation
* Delete information about a friendship when a friend is removed
* Only allow forfeiting if you can't move

// Low
// Base is 1-5
// Moves are made by subtracting rolls from places
// Render from low to high, starting at bottom right corner and proceeding clockwise

// High
// Base is 16 - 20
// Moves are made by adding rolls to places
// Render from high to low, starting at bottom left corner and proceeding anti-clockwise

**Security**
* Prevent users from updating other user fields

**Cleanup**
* Refactor the dialog code to avoid duplication
* Refactor model.js methods to pass in current user

**Resources**
