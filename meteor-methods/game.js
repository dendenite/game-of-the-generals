Meteor.methods({
  createNewGame: function(opponentId) {
    var currUserId = this.userId;

    // we have to store in a js obj first to have id values as field names
    var obj = {
      p1: currUserId,
      p2: opponentId,
      turn: currUserId,
      boardActual: {},
      donePositioning: {},
      boardViews: {},
      messages: [ArbiterMessages.getNewGame()],
      winner: null,
      left: null,
      numMoves: 0,
      lastMove: {}
    };

    obj.donePositioning[currUserId] = false;
    obj.donePositioning[opponentId] = false;

    obj.boardViews[currUserId] = {};
    obj.boardViews[opponentId] = {};

    OngoingGames.insert(obj);
  },

  sendMessage: function(gameId, message) {
    var game = OngoingGames.findOne(gameId);

    Validations.validateGame(game);

    OngoingGames.update(gameId, {
      $push: {
        messages: {sender: Meteor.user().username, message: message}
      }
    });
  },

  leave: function(gameId) {
    var game = OngoingGames.findOne(gameId);

    Validations.validateGame(game);
    Validations.validateLeave(game);

    if (_.isNull(game.left)) {
      OngoingGames.update(gameId, {
        $set:  {left: Meteor.userId()},
        $push: {messages: ArbiterMessages.getPlayerLeft()}
      });
    } else {
      OngoingGames.remove(gameId);
    }
  }
});
