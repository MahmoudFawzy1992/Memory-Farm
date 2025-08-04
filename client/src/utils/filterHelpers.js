export function handleFilter(emotionLabel, list, setFiltered) {
  if (emotionLabel === 'All' || !emotionLabel) {
    setFiltered(list)
  } else {
    setFiltered(
      list.filter((m) => {
        const label = (m.emotion || '').replace(/^\p{Emoji}+/u, '').trim()
        return label === emotionLabel
      })
    )
  }
}
