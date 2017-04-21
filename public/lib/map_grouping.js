define({
  get_grouping: function(map_name) {
    if (map_name == "us-md_mill_en_judicial") {
      return this.md_judicial_districts;
    }
    else {
      return undefined;
    }
  },

  get_group_by_region: function(grouping, code) {
    var selected_group;
    jQuery.each(grouping, function(group, regions) {
      if (jQuery.inArray(code, regions) > -1) {
        selected_group = group;
      }
    });
    return selected_group;
  },

  md_judicial_districts: {
    "Baltimore City":       ["BALTIMORE CITY"],
    "Lower Shore":          ["DORCHESTER", "SOMERSET", "WICOMICO", "WORCESTER"],
    "Upper Shore":          ["CECIL", "KENT", "QUEEN ANNE'S", "TALBOT", "CAROLINE"],
    "Southern Maryland":    ["CALVERT", "CHARLES", "ST. MARY'S"],
    "Prince George's":      ["PRINCE GEORGE'S"],
    "Montgomery":           ["MONTGOMERY"],
    "Anne Arundel":         ["ANNE ARUNDEL"],
    "Baltimore County":     ["BALTIMORE"],
    "Harford":              ["HARFORD"],
    "Central Maryland":     ["HOWARD", "CARROLL"],
    "Mid-Western Maryland": ["FREDERICK", "WASHINGTON"],
    "Western Maryland":     ["ALLEGANY", "GARRETT"]
  }
});
