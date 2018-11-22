function Team (id, name, color) {
    this.id = id
    this.name = name
    this.color = color
}
Team.fromJson = function(json) {
    return (
        new Team(
            json.id,
            json.name,
            Color.fromJson(json.color)
        )
    )
}