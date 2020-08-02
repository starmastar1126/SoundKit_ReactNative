export default Util = {
    getLinkFromText(text) {
        var words = text.split(/\s/);

        for(let i = 0;i<words.length;i++) {
            let word = words[i].toLowerCase();
            if (word.match(/^https?\:\//)) {
                return words[i];
            }
        }
    },

    inArray(needle, haystack) {
        var length = haystack.length;
        for(var i = 0; i < length; i++) {
            if(haystack[i] == needle) return true;
        }
        return false;
    },

    findIndex(needle,haystack) {
        var length = haystack.length;
        for(var i = 0; i < length; i++) {
            if(haystack[i] == needle) return i;
        }
        return false;
    },

    deleteFromArray(needle,haystack) {
        let newArray = [];
        for(var i = 0; i < haystack.length; i++) {
            if(haystack[i] !== needle) newArray.push(haystack[i]);
        }
        return newArray;
    },

    removeIndexFromArray(index, array) {
        array.splice(index, 1);
        return array;
    },


}