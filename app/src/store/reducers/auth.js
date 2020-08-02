import {DEFAULT_THEME} from "../../config";

export default function reducer(
    state = {
        userid : null,
        username : '',
        password : '',
        avatar : '',
        cover : '',
        apikey : '',
        didGetstarted : '',
        language : '',
        menus : [],
        theme : DEFAULT_THEME,
        setup : {}
    },
    action
) {
    switch (action.type)  {
        case 'SET_AUTH_DETAILS': {
            return { ...state,
                username: action.payload.username,
                userid : action.payload.userid,
                password: action.payload.password,
                avatar : action.payload.avatar,
                cover : action.payload.cover,
                apikey : action.payload.apikey,
                didGetstarted: action.payload.didGetstarted,
                language : action.payload.language,
                theme : action.payload.theme,
                setup : action.payload.setup
            };
            break;
        }

    }
    return state;
}

