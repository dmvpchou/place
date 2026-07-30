import { Fragment } from 'react'

/** 文案裡的 \n 是設計指定的斷行位置，不是排版意外。照斷。 */
export function Lines({ text }: { text: string }) {
  const parts = text.split('\n')
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {part}
        </Fragment>
      ))}
    </>
  )
}
