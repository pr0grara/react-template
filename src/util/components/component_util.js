export const delay = async (func, delay) => {
    await new Promise((resolve) => setTimeout(resolve, delay));
    func();
}