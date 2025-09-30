import type { InitConfiguration } from '../domain/configuration'
import { display } from '../tools/display'
import { displayAlreadyInitializedError } from './displayAlreadyInitializedError'

describe('displayAlreadyInitializedError', () => {
  it('should display an error', () => {
    const displayErrorSpy = spyOn(display, 'error')
    displayAlreadyInitializedError('MD_RUM', {} as InitConfiguration)
    expect(displayErrorSpy).toHaveBeenCalledTimes(1)
    expect(displayErrorSpy).toHaveBeenCalledWith('MD_RUM is already initialized.')
  })

  it('should not display an error if the "silentMultipleInit" option is used', () => {
    const displayErrorSpy = spyOn(display, 'error')
    displayAlreadyInitializedError('MD_RUM', { silentMultipleInit: true } as InitConfiguration)
    expect(displayErrorSpy).not.toHaveBeenCalled()
  })
})
