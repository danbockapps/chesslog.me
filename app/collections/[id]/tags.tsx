import SectionHeader, {captionClassNames} from '@/app/ui/SectionHeader'
import {FC, useCallback, useEffect, useState} from 'react'
import {MultiValue} from 'react-select'
import CreatableSelect from 'react-select/creatable'
import {useAppContext} from '../context'
import {deleteGameTags, insertGameTag, insertTag, getTags, getGameTags} from './actions/crudActions'
import ManageTags from './manageTags/manageTags'

interface Props {
  gameId: number
}

type Tag = {id: number; name: string | null}

const Tags: FC<Props> = (props) => {
  const [values, setValues] = useState<MultiValue<Tag> | null>()
  const [loading, setLoading] = useState(false)
  const [beenSaved, setBeenSaved] = useState(false)
  const [options, setOptions] = useState<Tag[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [manageOpen, setManageOpen] = useState(false)
  const {user} = useAppContext()

  const refresh = useCallback(async () => {
    if (user) {
      const [newOptions, newSelectedTagIds] = await Promise.all([
        getTags(),
        getGameTags(props.gameId),
      ])

      setOptions(newOptions ?? [])
      setSelectedTagIds(newSelectedTagIds ?? [])
    }
  }, [user, props.gameId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const selectedOptions =
    values ??
    (selectedTagIds.map((tagId) => options.find((tag) => tag.id === tagId)) as MultiValue<Tag>)

  return (
    <div>
      <SectionHeader
        title="Takeaways"
        description="Select tags or create your own"
        link={{text: 'Manage tags', onClick: () => setManageOpen(true)}}
      />

      <CreatableSelect
        isMulti
        isDisabled={loading}
        isLoading={loading}
        isClearable={false}
        value={selectedOptions}
        onChange={async (newValue) => {
          setLoading(true)
          const oldIds = selectedOptions.map((v) => v.id) ?? []
          const newIds = newValue.map((v) => v.id)

          if (oldIds.length > newIds.length) {
            await deleteGameTags(
              props.gameId,
              oldIds.filter((id) => !newIds.includes(id)),
            )
          } else if (oldIds.length < newIds.length) {
            await insertGameTag(newIds.filter((id) => !oldIds.includes(id))[0], props.gameId)
          }

          setValues(newValue)
          setBeenSaved(true)
          setLoading(false)
        }}
        onCreateOption={async (inputValue) => {
          setLoading(true)
          const data = await insertTag(inputValue)
          if (data && data.length !== 0) await insertGameTag(data[0]?.id, props.gameId)
          await refresh()
          setBeenSaved(true)
          setLoading(false)
        }}
        {...{options}}
        getOptionValue={({id}) => `${id}`}
        getOptionLabel={({name}) => name ?? ''}
      />

      <div className={`${captionClassNames} mt-5`}>
        {loading ? 'Saving...' : beenSaved ? '✓ Takeaways saved' : ''}
      </div>

      <ManageTags open={manageOpen} close={() => setManageOpen(false)} />
    </div>
  )
}

export default Tags
