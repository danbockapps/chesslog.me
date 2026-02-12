'use client'
import SectionHeader, {captionClassNames} from '@/app/ui/SectionHeader'
import {FC, useCallback, useEffect, useState} from 'react'
import {MultiValue} from 'react-select'
import CreatableSelect from 'react-select/creatable'
import {
  deleteGameTags,
  getGameTags,
  getGameTagsWithDetails,
  getTagsWithDetails,
  insertGameTag,
  insertTag,
} from './actions/crudActions'
import ManageTags from './manageTags/manageTags'

interface Props {
  gameId: number
  isOwner: boolean
  onTagCountChange?: (count: number) => void
}

type Tag = {id: number; name: string | null; public: boolean}

const tagBadgeClass = (tag: Tag) =>
  `badge gap-1 px-2 py-3 ${tag.public ? 'badge-primary text-primary-content' : 'badge-neutral text-neutral-content'}`

const Tags: FC<Props> = (props) => {
  const [values, setValues] = useState<MultiValue<Tag> | null>()
  const [loading, setLoading] = useState(false)
  const [beenSaved, setBeenSaved] = useState(false)
  const [options, setOptions] = useState<Tag[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [readOnlyTags, setReadOnlyTags] = useState<Tag[]>([])
  const [manageOpen, setManageOpen] = useState(false)

  const refresh = useCallback(async () => {
    if (props.isOwner) {
      const [newOptions, newSelectedTagIds] = await Promise.all([
        getTagsWithDetails(),
        getGameTags(props.gameId),
      ])
      setOptions(newOptions ?? [])
      setSelectedTagIds(newSelectedTagIds ?? [])
    } else {
      setReadOnlyTags(await getGameTagsWithDetails(props.gameId))
    }
  }, [props.gameId, props.isOwner])

  useEffect(() => {
    refresh()
  }, [refresh])

  if (!props.isOwner) {
    return (
      <div>
        <SectionHeader title="Takeaways" description="Tags added by the collection owner" />
        <div className="min-h-12 px-3 py-2 bg-base-100 border border-base-300 rounded-lg flex flex-wrap gap-1 items-center">
          {readOnlyTags.length === 0 ? (
            <span className="text-base-content/50 text-sm">No takeaways</span>
          ) : (
            readOnlyTags.map((tag) => (
              <span key={tag.id} className={tagBadgeClass(tag)}>
                <span className="text-sm">{tag.name}</span>
              </span>
            ))
          )}
        </div>
      </div>
    )
  }

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
          props.onTagCountChange?.(newValue.length)
        }}
        onCreateOption={async (inputValue) => {
          setLoading(true)
          const data = await insertTag(inputValue)
          if (data && data.length !== 0) await insertGameTag(data[0]?.id, props.gameId)
          await refresh()
          setBeenSaved(true)
          setLoading(false)
          props.onTagCountChange?.((selectedOptions?.length ?? 0) + 1)
        }}
        {...{options}}
        getOptionValue={({id}) => `${id}`}
        getOptionLabel={({name}) => name ?? ''}
        unstyled
        classNames={{
          control: () =>
            'min-h-12 px-3 py-2 bg-base-100 border border-base-300 rounded-lg hover:border-base-content/30 transition-colors flex flex-wrap gap-1',
          valueContainer: () => 'flex flex-wrap gap-1 p-0',
          multiValue: ({data}) => tagBadgeClass(data),
          multiValueLabel: () => 'text-sm',
          multiValueRemove: () => 'hover:bg-base-content/20 rounded-full px-1 ml-1 cursor-pointer',
          input: () => 'text-base-content m-0 p-0',
          placeholder: () => 'text-base-content/50',
          menu: () =>
            'mt-2 bg-base-200 border border-base-300 rounded-lg shadow-lg overflow-hidden',
          menuList: () => 'py-1',
          option: ({isFocused, isSelected}) =>
            `px-3 py-2 cursor-pointer transition-colors ${
              isSelected
                ? 'bg-primary text-primary-content'
                : isFocused
                  ? 'bg-base-300'
                  : 'bg-base-200 text-base-content'
            }`,
          noOptionsMessage: () => 'px-3 py-2 text-base-content/50',
          loadingMessage: () => 'px-3 py-2 text-base-content/50',
        }}
      />

      <div className={`${captionClassNames} mt-5`}>
        {loading ? 'Saving...' : beenSaved ? '✓ Takeaways saved' : ''}
      </div>

      <ManageTags open={manageOpen} close={() => setManageOpen(false)} />
    </div>
  )
}

export default Tags
