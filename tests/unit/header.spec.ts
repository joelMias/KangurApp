import { mount } from '@vue/test-utils'
import Header from '@/components/Header.vue'
import { describe, expect, test } from 'vitest'

describe('Header.vue', () => {
  test('muestra el logo y el título', () => {
    const wrapper = mount(Header)

    // log existeix?
    const logo = wrapper.find('img.header-logo')
    expect(logo.exists()).toBe(true)

    // titol existeix i te el text KANGURAPP?
    expect(wrapper.text()).toContain('KANGURAPP')
  })
})