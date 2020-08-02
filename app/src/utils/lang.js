import LocalizedStrings from 'react-native-localization';
import en from "../languages/en";
import de from "../languages/de";
import es from "../languages/es";
import fr from "../languages/fr";
import it from "../languages/it";
import ja from "../languages/ja";
import nl from "../languages/nl";
import pl from "../languages/pl";
import pt from "../languages/pt";
import ru from "../languages/ru";

let lang = new LocalizedStrings({
    en : en,
    de : de,
    es : es,
    fr : fr,
    it : it,
    ja : ja,
    nl : nl,
    pl : pl,
    pt : pt,
    ru : ru
});

export default lang;

