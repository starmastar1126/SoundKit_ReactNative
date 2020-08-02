class DummyData {
    datas = {
        tracks : [
            {
                id:121,
                art :'',
                title : 'A Dummy messic',
                user : {id : 1, avatar : '',cover : '',}
            },
            {
                id:121,
                art :'',
                title : 'A Dummy messic',
                user : {id : 1, avatar : '',cover : '',}
            }
        ]
    }

    get(key,object) {
        let result = this.datas[key];
        return this.datas.tracks;
        if (result === undefined) return (object === undefined) ? [] : {};
        return result;
    }
}

let Dummy = new DummyData();
export default Dummy;