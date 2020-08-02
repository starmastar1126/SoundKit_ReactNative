import {Text} from "react-native";
import React from 'react';
import TimeAgo from 'react-timeago'
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter'
import lang from "./lang";

const formatter = buildFormatter({
    prefixAgo: null,
    prefixFromNow: null,
    suffixAgo: lang.getString('ago'),
    suffixFromNow: lang.getString('from_now'),
    seconds: lang.getString('just_now'),
    minute: lang.getString('about_a_minute'),
    minutes: lang.getString('d_minutes'),
    hour: lang.getString('about_an_hour'),
    hours: lang.getString('about_d_hours'),
    day: lang.getString('a_day'),
    days: lang.getString('d_days'),
    month: lang.getString('about_a_month'),
    months: lang.getString('d_months'),
    year: lang.getString('a_year'),
    years: lang.getString('d_years'),
    wordSeparator: ' ',
});

class Time {
    format(value) {
        if (value === undefined) return;
        let timeValue = value.split(":");
        let {time,text} = timeValue;

        return timeValue[0] + ' ' + this.formatText(timeValue[1])
    }

    ago(value) {
        return (<TimeAgo formatter={formatter}
                         component={Text}
                         date={value}
        />);
    }


    getDay(time) {

        let date = new Date(parseInt(time) * 1000);

        return date.getDate();
    }

    getHour(time) {
        let date = new Date(parseInt(time) * 1000);

        return date.getHours();
    }

    getHourType(time) {
        let hour = this.getHour(time);
        return (hour >= 12) ? 'PM' : 'AM';
    }

    getMonth(time) {
        let date = new Date(parseInt(time) * 1000);
        //console.log(date);
        let month  = date.getMonth();
        let names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return names[month];
    }

    getMonthName(month) {
        let names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return names[month];
    }

    getDayName(time) {
        let days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
        let d = new Date(parseInt(time) * 1000);
        return days[d.getDay()];
    }

    formatText(text){
        switch(text) {
            case 'hours-ago':
                return lang.getString('hours_ago');
                break;
            case 'days-ago':
                return lang.getString('days_ago');
                break;
            case 'weeks-ago':
                return lang.getString('weeks_ago');
                break;
            case 'years-ago':
                return lang.getString('years_ago');
                break;
            case 'months-ago':
                return lang.getString('months_ago');
                break;
            case 'minutes-ago':
                return lang.getString('minutes_ago');
                break;
            case 'seconds-ago':
                return lang.getString('seconds_ago');
                break;
            default:
                return lang.getString(text);
                break;
        }
    }
}

const time = new Time();

export default time;