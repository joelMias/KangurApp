import { mount } from '@vue/test-utils'
import Login from '@/views/Login.vue'
import authService from '@/services/auth.service'

vi.mock('@/services/auth.service', () => ({
  default: { login: vi.fn() }
}))

describe('Login.vue', () => {
  it('shows a toast when credentials are incorrect', async () => {
    // @ts-ignore
    authService.login.mockRejectedValue(new Error('invalid'))

    const wrapper = mount(Login)

    // set fields and trigger login
    // @ts-ignore
    wrapper.vm.email = 'a@b.com'
    // @ts-ignore
    wrapper.vm.password = 'wrong'

    // Call the login method directly
    // @ts-ignore
    await wrapper.vm.Login()

    // Check that toast was shown
    // @ts-ignore
    expect(wrapper.vm.showToast).toBe(true)
    // @ts-ignore
    expect(wrapper.vm.toastMessage).toBe('Credencials incorrectes.')
  })
})
