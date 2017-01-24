Template.selectHouse.helpers({
	housesNameId: function() {
		return HousesCollection.find({}, {fields: {name: 1, _id: 1} });
	},
	isSelected: function() {
		return Session.equals('selectedHouseId', this._id) ? 'selected' : '';
	}
});

Template.selectHouse.events({
	'change #selectHouse': function(evt) {
		var selectedId = evt.currentTarget.value;
		var newId = LocalHouse.upsert(
			selectedId,
			HousesCollection.findOne(selectedId) || newHouse).insertedId;
		if (!newId) newId = selectedId;
		Session.set('selectedHouseId', newId);
	}
});

Template.showHouse.events({
	'click button#delete': function(evt) {
		var id = this._id;
		var deleteConfirmation = confirm('Really delete this house?');
		if (deleteConfirmation) {
			HousesCollection.remove(id);
		}
	}
});

Template.plantDetails.helpers({
	isWatered: function() {
		var plantId = Session.get("selectedHouseId") + '-' + this.color;
		return Session.get(plantId) ? 'disabled' : '';
	}
});

Template.plantDetails.events({
	'click button.water': function(evt) {
		var plantId = $(evt.currentTarget).attr('data-id');
		Session.set(plantId, true);
		var lastvisit = new Date();
		HousesCollection.update({
			_id: Session.get("selectedHouseId")
		}, {
			$set: {
				lastvisit: lastvisit
			}
		});
	}
});

Template.houseForm.events({
	'click button#saveHouse': function(evt) {
		evt.preventDefault();
		var houseName = $('input[id=house-name]').val();
		var plantColor = $('input[id=plant-color]').val();
		var plantInstructions = $('input[id=plant-instructions').val();
		Session.set('selectedHouseId', HousesCollection.insert({
			name: houseName,
			plants: [{
				color: plantColor,
				instructions: plantInstructions
			}]
		}));
		// empty the form
		$('input').val('');
	}
});

LocalHouse = new Mongo.Collection(null);
var newHouse = {
	name: '',
	plants: [],
	lastsave: 'never',
	status: 'unsaved'
	};
Session.setDefault('selectedHouseId', '');

Template.registerHelper('selectedHouse', function() {
	return LocalHouse.findOne(Session.get('selectedHouseId'));
});