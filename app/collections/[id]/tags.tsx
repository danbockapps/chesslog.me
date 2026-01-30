'use client'
import {themeColors} from '@/app/theme/theme'
import SectionHeader, {captionClassNames} from '@/app/ui/SectionHeader'
import {FC, useCallback, useEffect, useState} from 'react'
import {MultiValue, StylesConfig, ThemeConfig} from 'react-select'
import CreatableSelect from 'react-select/creatable'
import {useAppContext} from '../context'
import {
  deleteGameTags,
  getGameTags,
  getTagsWithDetails,
  insertGameTag,
  insertTag,
} from './actions/crudActions'
import ManageTags from './manageTags/manageTags'

interface Props {
  gameId: number
}

type Tag = {id: number; name: string | null; public: boolean}

const Tags: FC<Props> = (props) => {
  const [values, setValues] = useState<MultiValue<Tag> | null>()
  const [loading, setLoading] = useState(false)
  const [beenSaved, setBeenSaved] = useState(false)
  const [options, setOptions] = useState<Tag[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [manageOpen, setManageOpen] = useState(false)
  const {user, isDarkMode} = useAppContext()

  const refresh = useCallback(async () => {
    if (user) {
      const [newOptions, newSelectedTagIds] = await Promise.all([
        getTagsWithDetails(),
        getGameTags(props.gameId),
      ])

      setOptions(newOptions ?? [])
      setSelectedTagIds(newSelectedTagIds ?? [])
    }
  }, [user, props.gameId])

  // Changes when: user loads the component or navigates to this page
  useEffect(() => {
    refresh()
  }, [refresh])

  const selectedOptions =
    values ??
    (selectedTagIds.map((tagId) => options.find((tag) => tag.id === tagId)) as MultiValue<Tag>)

  const colors = isDarkMode ? themeColors.dark : themeColors.light

  const customStyles: StylesConfig<Tag, true> = {
    multiValue: (base, {data}) => ({
      ...base,
      backgroundColor: data.public ? colors.successFilled : colors.primaryFilled,
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: 'white',
      fontWeight: 500,
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: 'white',
      ':hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        color: 'white',
      },
    }),
  }

  const customTheme: ThemeConfig = (theme) => ({
    ...theme,
    colors: {
      ...theme.colors,
      primary: colors.primary,
      primary75: colors.primary,
      primary50: colors.primary,
      primary25: isDarkMode ? colors.surfaceHover : colors.border,
      danger: colors.error,
      dangerLight: colors.error,
      neutral0: colors.surface, // background
      neutral5: colors.surfaceHover,
      neutral10: colors.border,
      neutral20: colors.border,
      neutral30: colors.border,
      neutral40: colors.textSecondary,
      neutral50: colors.textSecondary,
      neutral60: colors.textSecondary,
      neutral70: colors.textPrimary,
      neutral80: colors.textPrimary,
      neutral90: colors.textPrimary,
    },
  })

  return (
    <div>
      <SectionHeader
        title="Takeaways"
        description="Select tags or create your own"
        link={{text: 'Manage tags', onClick: () => setManageOpen(true)}}
      />

      <CreatableSelect
        key={isDarkMode ? 'dark' : 'light'} // Force re-render on theme change
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
        styles={customStyles}
        theme={customTheme}
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
