import { DateRange } from 'react-date-range'

import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'

const DatePicker = ({ value, setValue }) => {
  // console.log(value);
  return (
    <DateRange
      rangeColors={['#F43F5E']}
      ranges={[value]}
      date={new Date(value?.startDate)}
      // onChange={() =>setValue({...value})}
      direction='vertical'
      showDateDisplay={false}
      minDate={new Date(value?.startDate)}
      maxDate={new Date(value?.endDate)}
    />
  )
}

export default DatePicker
