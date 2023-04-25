function isMessageInteractionFromCommand(id, startString) {
	let pattern = new RegExp(`${startString}.*`);
	return id.search(pattern);
}

module.exports = isMessageInteractionFromCommand;