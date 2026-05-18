export function roll() {

  const random = Math.random()

  if(random <= 0.006) {
    return 5
  }

  if(random <= 0.057) {
    return 4
  }

  return 3
}