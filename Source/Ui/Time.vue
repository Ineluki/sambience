<template>
	<time>{{formatted}}</time>
</template>

<script>
const div = [60,60,24];
export default {
	name: 'time',

	props: {
		sec: Number
	},
	data: function () {

		return {};
	},
	computed: {
		datetime: function() {
			let d = new Date(this.sec);
			return d.toISOString();
		},
		formatted: function() {
			let r = [];
			let s = this.sec;
			if (isNaN(s)) return '';
			div.forEach((d) => {
				if (s === 0) return;
				let x = ""+s % d;
				s = Math.floor( s / d );
				if (s > 0 && x.length < 2) {
					x = "0"+x;
				}
				r.push(x);
			});
			return r.reverse().join(':');
		}
	},

}
</script>

