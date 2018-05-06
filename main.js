window.addEventListener( 'DOMContentLoaded', main )

const query = ( selector, targets = [ document ] ) => {
	return targets.map( t => t.querySelector( selector ) ).filter( e => !! e ) [ 0 ]
}

let draging = null

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
				let img = target.querySelector( 'img' )

				target.addEventListener( 'dblclick', e => {
					let to = new Image
					to.src = img.src
					imageArea.append( to )
					img.removeAttribute( 'src' )
				} )

				target.addEventListener( 'dragstart', e => { draging = img } )

				target.addEventListener( 'drop', e => {
					let url = e.dataTransfer.getData( 'text/uri-list' )
					if ( ! url ) return
					let src = img.src
					img.src = url
					if ( src ) draging.src = src
					else draging.removeAttribute( 'src' )
				} )

				shadow.append( content )
			}


		}
	}

	customElements.define( 'column-set', ColumnSet )

	for ( let i = 0; i < 10; i++ ) {
		printTarget.append( document.createElement( 'column-set' ) )
	}





	window.addEventListener( 'dragover', e => e.preventDefault( ) )
	imageArea.addEventListener( 'drop', async e => {
		const files = [ ]
		const entry = e.dataTransfer.items[ 0 ].webkitGetAsEntry( )
		if ( ! entry ) return
		await readEntry( entry )

		for ( let file of files ) {
			let img = new Image
			img.src = URL.createObjectURL( file )
			img.decode( ).then( ( ) => {
				img.addEventListener( 'dragstart', e => { draging = img } )
				imageArea.append( img )
			}, e => null )
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
