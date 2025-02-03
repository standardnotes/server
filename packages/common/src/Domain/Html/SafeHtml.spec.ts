import { safeHtml } from './SafeHtml'

describe('html', () => {
  test('Should escape html from user input', () => {
    const basicStringInput = '<h1>User</h1>'
    const numberValue = 10
    expect(safeHtml`<p>Hello world, ${basicStringInput} ${numberValue}</p>`).toBe(
      '<p>Hello world, &lt;h1&gt;User&lt;/h1&gt; 10</p>',
    )
  })

  test('Should join arrays and escape', () => {
    const arrayOfStrings = ['<h1>User</h1>', '<p>Test</p>']
    expect(safeHtml`<p>${arrayOfStrings}</p>`).toBe('<p>&lt;h1&gt;User&lt;/h1&gt;&lt;p&gt;Test&lt;/p&gt;</p>')
  })
})
