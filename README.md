# Tavli

Modern backgammon.

## Running

To fetch packages first:

``` mrt update ```

To run:

``` meteor ```

To run with debugging:

``` NODE_OPTIONS='--debug' meteor ```

## TODO

**Must Haves**

* Roll per turn

**Nice to Haves**
* Undo
* Friend search
* Friend requests
* Roll validation (e.g. two turns per role)
* Move validation
* Delete information about a friendship when a friend is removed
* Only allow forfeiting if you can't move
* Notification of why you can't move (i.e. you have a piece in limbo, wrong direction, not your turn)

**Security**
* Prevent users from updating other user fields

**Cleanup**
* Refactor the dialog code to avoid duplication
* Refactor model.js methods to pass in current user

**Resources**
