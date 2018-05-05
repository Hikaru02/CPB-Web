window.addEventListener( 'DOMContentLoaded', main )

const query = selector => document.querySelector( selector )


async function main ( ) {

	const imageArea = query( 'bottom-image' )
	const printTarget = query( 'print-target' )
	const columnStyle = query( '#column-style' ).content
	const columnSetContent = query( '#column-set' ).content

	class ColumnSet extends HTMLElement {
		constructor ( ) {
			super( )

			let shadow = this.attachShadow( { mode: 'open' } )

			shadow.append( document.importNode( columnStyle, true ) )
			for ( let i = 0; i < 3; i ++ ) {
				let content = document.importNode( columnSetContent, true )
				let target = content.firstElementChild
				target.addEventListener( 'drop', async e => {
					let url = e.dataTransfer.getData( 'text/uri-list' )
					if ( ! url ) return
					let img = target.querySelector( 'img' )
					img.src = url
					img.decode( ).catch( ( ) => img.remove( ) )
				} )
				shadow.append( content )
			}


		}
	}

	customElements.define( 'column-set', ColumnSet )

	for ( let i = 0; i < 5; i++ ) {
		printTarget.append( document.createElement( 'column-set' ) )
	}




	window.addEventListener( 'dragover', e => e.preventDefault( ) )
	imageArea.addEventListener( 'drop', async e => {
		const files = [ ]
		const entry = e.dataTransfer.items[ 0 ].webkitGetAsEntry( )
		if ( ! entry ) return
		await readEntry( entry )
		console.log( files )

		for ( let file of files ) {
			let img = new Image
			img.src = URL.createObjectURL( file )
			img.decode( ).then( ( ) => imageArea.append( img ) )
		}




		function readEntry ( entry ) {
			if ( entry.isFile ) {
				return new Promise ( ok => {
					entry.file( file => {
						files.push( file )
						ok( )
					} )
				} )
			} else {
				return new Promise( ok => {
					entry.createReader( ).readEntries(
						entries => ok( Promise.all( entries.map( readEntry ) ) )
					)
				} )
			}
		}



	} )

}
