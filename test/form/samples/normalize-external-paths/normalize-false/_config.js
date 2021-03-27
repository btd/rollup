const path = require('path');
const assert = require('assert');

const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = {
	description: 'does not normalize external paths when set to false',
	options: {
		makeAbsoluteExternalsRelative: false,
		external(id) {
			if (['./relativeUnresolved.js', '../relativeUnresolved.js', '/absolute.js'].includes(id))
				return true;
		},
		plugins: {
			async buildStart() {
				const testExternal = async (source, expected) =>
					assert.deepStrictEqual((await this.resolve(source, ID_MAIN)).external, expected, source);

				await testExternal('./relativeUnresolved.js', true);
				await testExternal('/absolute.js', 'absolute');
				await testExternal('./pluginDirect.js', true);
				await testExternal('./pluginTrue.js', 'absolute');
				await testExternal('./pluginAbsolute.js', 'absolute');
				await testExternal('./pluginNormalize.js', true);
			},
			resolveId(source) {
				if (source.endsWith('/pluginDirect.js')) return false;
				if (source.endsWith('/pluginTrue.js')) return { id: '/pluginTrue.js', external: true };
				if (source.endsWith('/pluginAbsolute.js'))
					return { id: '/pluginAbsolute.js', external: 'absolute' };
				if (source.endsWith('/pluginNormalize.js'))
					return { id: path.join(__dirname, 'pluginNormalize.js'), external: 'relative' };
			}
		}
	}
};
